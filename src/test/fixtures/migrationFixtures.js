export const migrationFixtures = {
    v48_00: {
        version: 48,
        classes: [
            {
                name: 'Class Legacy 48.00',
                subjects: [
                    {
                        name: 'Math',
                        topics: [
                            {
                                title: 'Algebra',
                                items: [{ label: 'Theory Questions', checked: false }]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    v48_10: {
        version: 49,
        classes: [
            {
                id: 'class-a',
                name: 'Class Legacy 48.10',
                archived: false,
                subjects: [
                    {
                        id: 'subject-a',
                        name: 'Physics',
                        topics: [
                            {
                                id: 'topic-a',
                                title: 'Kinematics',
                                priority: 'High',
                                items: [{ id: 'item-a', label: 'Workbook', checked: true }]
                            }
                        ]
                    }
                ]
            }
        ],
        quickInbox: [{ text: 'Capture idea without id' }]
    },
    v48_25: {
        version: 50,
        template: [{ label: 'Custom Template Without ID' }],
        classes: [
            {
                id: 'class-b',
                name: 'Class Legacy 48.25',
                subjects: [
                    {
                        id: 'subject-b',
                        name: 'Chemistry',
                        topics: [
                            {
                                id: 'topic-b',
                                title: 'Organic',
                                notes: 'revise',
                                dueDate: '2026-03-01',
                                items: [{ id: 'item-b', label: 'Assignment', checked: false }]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    v48_31: {
        version: 51,
        templateVersion: 2,
        userProfile: { name: 'Teacher' },
        quickInbox: [{ id: 'inbox-1', text: 'Plan grammar drill', createdAt: new Date().toISOString() }],
        classes: [
            {
                id: 'class-c',
                name: 'Class Legacy 48.31',
                subjects: [
                    {
                        id: 'subject-c',
                        name: 'English',
                        topics: [
                            {
                                id: 'topic-c',
                                title: 'Grammar',
                                createdAt: new Date().toISOString(),
                                items: [{ id: 'item-c', label: 'Grammar', checked: true, checkedAt: new Date().toISOString() }]
                            }
                        ]
                    }
                ]
            }
        ]
    }
};
