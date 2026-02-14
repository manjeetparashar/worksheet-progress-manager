import { useEffect } from 'react';
import { useRegisterShortcut } from './useShortcuts.jsx';

export const useZenNavigation = () => {
    // Helper to get focusable elements of current type
    const getElements = (type) => Array.from(document.querySelectorAll(`[data-${type}-id]`));

    const navDown = () => {
        const active = document.activeElement;
        const container = active.closest('[data-class-id], [data-subject-id], [data-topic-id], [data-item-id]');
        if (!container) {
            const first = document.querySelector('[data-class-id]');
            if (first) first.focus();
            return;
        }
        
        const type = container.hasAttribute('data-item-id') ? 'item' : 
                     container.hasAttribute('data-topic-id') ? 'topic' : 
                     container.hasAttribute('data-subject-id') ? 'subject' : 'class';
        
        const all = getElements(type);
        const idx = all.indexOf(container);
        if (idx !== -1 && idx < all.length - 1) all[idx + 1].focus();
    };

    const navUp = () => {
        const active = document.activeElement;
        const container = active.closest('[data-class-id], [data-subject-id], [data-topic-id], [data-item-id]');
        if (!container) return;
        
        const type = container.hasAttribute('data-item-id') ? 'item' : 
                     container.hasAttribute('data-topic-id') ? 'topic' : 
                     container.hasAttribute('data-subject-id') ? 'subject' : 'class';
        
        const all = getElements(type);
        const idx = all.indexOf(container);
        if (idx > 0) all[idx - 1].focus();
    };

    const drillIn = () => {
        const active = document.activeElement;
        const container = active.closest('[data-class-id], [data-subject-id], [data-topic-id], [data-item-id]');
        if (!container) return;

        let childSelector;
        if (container.hasAttribute('data-class-id')) childSelector = '[data-subject-id]';
        else if (container.hasAttribute('data-subject-id')) childSelector = '[data-topic-id]';
        else if (container.hasAttribute('data-topic-id')) childSelector = '[data-item-id]';

        if (childSelector) {
            const firstChild = container.querySelector(childSelector);
            if (firstChild) firstChild.focus();
        }
    };

    const drillOut = () => {
        const active = document.activeElement;
        const container = active.closest('[data-class-id], [data-subject-id], [data-topic-id], [data-item-id]');
        if (!container) return;

        let parentSelector;
        if (container.hasAttribute('data-item-id')) parentSelector = '[data-topic-id]';
        else if (container.hasAttribute('data-topic-id')) parentSelector = '[data-subject-id]';
        else if (container.hasAttribute('data-subject-id')) parentSelector = '[data-class-id]';

        if (parentSelector) {
            const parent = container.closest(parentSelector);
            if (parent) parent.focus();
        }
    };

    // Register Zen Navigation Shortcuts
    useRegisterShortcut('j', navDown, 'Navigate Down', 'Navigation');
    useRegisterShortcut('k', navUp, 'Navigate Up', 'Navigation');
    useRegisterShortcut('l', drillIn, 'Drill In', 'Navigation');
    useRegisterShortcut('i', drillIn, 'Drill In', 'Navigation');
    useRegisterShortcut('h', drillOut, 'Drill Out', 'Navigation');
    useRegisterShortcut('arrowdown', navDown, 'Navigate Down', 'Navigation');
    useRegisterShortcut('arrowup', navUp, 'Navigate Up', 'Navigation');
    useRegisterShortcut('arrowright', drillIn, 'Drill In', 'Navigation');
    useRegisterShortcut('arrowleft', drillOut, 'Drill Out', 'Navigation');
    
    useRegisterShortcut('home', () => {
        const first = document.querySelector('[data-class-id]');
        if (first) first.focus();
    }, 'Go to Top', 'Navigation');

    useRegisterShortcut('end', () => {
        const all = document.querySelectorAll('[data-class-id]');
        if (all.length > 0) all[all.length - 1].focus();
    }, 'Go to Bottom', 'Navigation');

    useRegisterShortcut('x', () => {
        const active = document.activeElement;
        const container = active.closest('[data-class-id], [data-subject-id], [data-topic-id], [data-item-id]');
        if (!container) return;
        const btn = container.querySelector('button[aria-label*="Delete"], button[aria-label*="delete"]');
        if (btn) btn.click();
    }, 'Delete Focused', 'Editing');

    useRegisterShortcut('space', (e) => {
        const active = document.activeElement;
        const container = active.closest('[data-class-id], [data-subject-id], [data-topic-id], [data-item-id]');
        if (!container) return;
        
        if (container.hasAttribute('data-item-id')) {
            const cb = container.querySelector('input[type="checkbox"]');
            if (cb) cb.click();
        } else {
            // Expansion toggle
            container.click(); // We made the class bar clickable, and others have buttons
        }
    }, 'Toggle/Expand', 'Navigation');
};