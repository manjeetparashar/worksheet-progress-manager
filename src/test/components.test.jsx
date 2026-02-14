import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EditableText } from '../components/EditableText';

describe('EditableText Component', () => {
    it('renders the initial value', () => {
        render(<EditableText value="Initial Value" onSave={() => {}} />);
        expect(screen.getByText('Initial Value')).toBeInTheDocument();
    });

    it('switches to input on click', () => {
        render(<EditableText value="Click me" onSave={() => {}} />);
        const element = screen.getByText('Click me');
        fireEvent.click(element);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveValue('Click me');
    });

    it('calls onSave when entering new text and blurring', () => {
        const onSave = vi.fn();
        render(<EditableText value="Change me" onSave={onSave} />);
        
        // Enter edit mode
        fireEvent.click(screen.getByText('Change me'));
        
        // Change value
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'New Value' } });
        
        // Blur to save
        fireEvent.blur(input);
        
        expect(onSave).toHaveBeenCalledWith('New Value');
    });
});