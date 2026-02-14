import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WorksheetContext } from '../context';
import { ClassComponent } from '../components/ClassComponent';

vi.mock('../components/SortableList', () => ({
    SortableList: ({ items, renderItem }) => <div>{items.map(renderItem)}</div>
}));

vi.mock('../components/SubjectComponent', () => ({
    SubjectComponent: ({ onDelete }) => (
        <button onClick={onDelete} aria-label="Delete Subject Stub">
            Delete Subject Stub
        </button>
    )
}));

describe('ClassComponent', () => {
    it('deletes subject by updating class shape, not subject shape', () => {
        const onUpdate = vi.fn();
        const cls = {
            id: 'class-1',
            name: 'Class A',
            collapsed: false,
            subjects: [{ id: 'sub-1', name: 'Math', topics: [], collapsed: false }]
        };

        render(
            <WorksheetContext.Provider value={{ zenMode: false }}>
                <ClassComponent
                    cls={cls}
                    onUpdate={onUpdate}
                    onDelete={() => {}}
                    template={[]}
                    viewMode="active"
                    filters={new Set()}
                    onBulkSelect={{
                        selectedIds: new Set(),
                        isSelected: () => false,
                        handleSelection: vi.fn(),
                        clearSelection: vi.fn()
                    }}
                    visibleTopicIds={[]}
                    isFiltered={false}
                />
            </WorksheetContext.Provider>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Delete Subject Stub' }));
        const payload = onUpdate.mock.calls[0][0];

        expect(payload.id).toBe('class-1');
        expect(payload.name).toBe('Class A');
        expect(payload.subjects).toEqual([]);
    });
});
