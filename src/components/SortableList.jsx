import React, { useRef, useEffect } from 'react';
import Sortable from 'sortablejs';

export const SortableList=({items,onReorder,renderItem,className, disabled})=>{
    const listRef=useRef(null);
    const sortableRef=useRef(null);
    const itemsRef=useRef(items);

    useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    useEffect(()=>{
        if(!listRef.current||!onReorder || disabled) return;
        sortableRef.current = new Sortable(listRef.current,{
            animation:150,
            handle:'.drag-handle',
            ghostClass:'sortable-ghost',
            chosenClass:'sortable-chosen',
            dragClass:'sortable-drag',
            supportPointer: false,
            onEnd:evt=>{
                if(evt.oldIndex!==evt.newIndex){
                    const n=[...itemsRef.current];
                    const[moved]=n.splice(evt.oldIndex,1);
                    n.splice(evt.newIndex,0,moved);
                    onReorder(n);
                }
            }
        });
        return()=>{
            sortableRef.current?.destroy();
            sortableRef.current = null;
        };
    },[disabled, onReorder]);
    return(<div ref={listRef} className={className}>{items.map(renderItem)}</div>);
};
