import React from 'react';
import { FaTimes, FaEye } from 'react-icons/fa';
import { useColorMode } from '../../../contexts/ColorMode';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const grid = 8;

const LayersDisplay = (props) => {
  const { 
    activeItemList, 
    setActiveItemList,
    updateSessionLayerActiveItemList, 
    hideItemInLayer,
    selectedId,
    setSelectedId 
  } = props;

  const { colorMode } = useColorMode();

  const bgColorDragging = colorMode === 'dark' ? '#1f2937' : '#fafafa';
  const bgColorDraggingOver = colorMode === 'dark' ? '#030712' : '#f5f5f5';
  
  const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver ? bgColorDraggingOver : bgColorDragging,
    padding: grid,
    width: 200
  });

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const newItems = reorder(
      [...activeItemList],
      result.source.index,
      result.destination.index
    );

    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      id: `item_${index}`
    }));

    setActiveItemList(reorderedItems);
    updateSessionLayerActiveItemList(reorderedItems);
  };
  
  const deleteItem = (id) => {
    const filteredItems = activeItemList.filter(item => item.id !== id);
    
    const reorderedItems = filteredItems.map((item, index) => ({
      ...item,
      id: `item_${index}`
    }));

    setActiveItemList(reorderedItems);
    updateSessionLayerActiveItemList(reorderedItems);
  };

  const isDraggingBGColor = colorMode === 'dark' ? '#263B4A' : '#a8a29e';
  const isStableBGColor = colorMode === 'dark' ? '#171717' : '#d6d3d1';
  const textColor = colorMode === 'dark' ? 'white' : '#171717';

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {activeItemList.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => setSelectedId(item.id)}
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
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    {`item ${item.id} - ${item.type}`}
                    <div className='ml-1 mr-1'>
                      <FaEye onClick={() => hideItemInLayer(item.id)} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                      style={{ color: 'white' }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export default LayersDisplay;
