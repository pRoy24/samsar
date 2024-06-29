import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { useColorMode } from '../../../contexts/ColorMode';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaEye } from 'react-icons/fa6';

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;


export default function LayersDisplay(props) {

  const { activeItemList, setActiveItemList, updateSessionLayerActiveItemList, hideItemInLayer } = props;

  const { colorMode } = useColorMode();

  const bgColorDragging = colorMode === 'dark' ? '#1f2937' : '#fafafa';
  const bgColorDraggingOver = colorMode === 'dark' ? '#030712' : '#f5f5f5';
  
  const getListStyle = (isDraggingOver) => {
    return {
      background: isDraggingOver ? bgColorDraggingOver: bgColorDragging,
      padding: grid,
      width: 200
    };
  }

  const onDragEnd = result => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const newItems = reorder(
      [...activeItemList].reverse(),  // Reverse the list before reordering
      result.source.index,
      result.destination.index
    ).reverse();  // Reverse back to the original order
    setActiveItemList(newItems);
    updateSessionLayerActiveItemList(newItems);
  };
  
  const deleteItem = (id) => {
    // Filter out the item with the matching id
    const filteredItems = activeItemList.filter(item => item.id !== id);
    
    // Reorder the IDs of the remaining items
    const reorderedItems = filteredItems.map((item, index) => ({
      ...item,
      id: `item_${index}`
    }));

    // Update the activeItemList with the reordered items
    setActiveItemList(reorderedItems);
    updateSessionLayerActiveItemList(reorderedItems);
  };

  let isDraggingBGColor = colorMode === 'dark' ? '#263B4A' : '#a8a29e';
  let isStableBGColor = colorMode === 'dark' ? '#171717' : '#d6d3d1';
  let textColor = colorMode === 'dark' ? 'white' : '#171717';

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {[...activeItemList].reverse().map((item, index) => {
              const itemId = `list_item_${item.id}`;
              const itemContent = `item ${item.id} - ${item.type}`;
              return (
                <Draggable key={item.id} draggableId={itemId} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        margin: '8px',
                        backgroundColor: snapshot.isDragging ? isDraggingBGColor : isStableBGColor,
                        border: '1px solid #64748b',
                        color: textColor,
                        padding: '8px',


                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      {itemContent}
                      <div className='ml-1 mr-1'>
                        <FaEye onClick={() => hideItemInLayer(item.id)}/>
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        style={{ color: 'white' }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
