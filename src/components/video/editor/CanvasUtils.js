import ResizableImage from "../../editor/ResizableImage.tsx";
import ResizableText from "../../editor/ResizableText.tsx";
import ResizableRectangle from "../../editor/shapes/ResizableRectangle.tsx";
import ResizablePolygon from "../../editor/shapes/ResizablePolygon.tsx";
import ResizableCircle from "../../editor/shapes/ResizableCircle.tsx";
import ResizableDialogBubble from "../../editor/shapes/ResizableDialogBubble.tsx";


export function ActiveRenderItem(props) {
  const {
    item,
    index,
    selectedId,
    setSelectedLayer,
    setSelectedId,
    selectedFrameId,
    showMask,
    updateToolbarButtonPosition,
    isDraggable,
    updateTargetActiveLayerConfig,
    isLayerSeeking,
    selectLayer,
    updateTargetShapeActiveLayerConfig,
    onChange,
    sessionId

  } = props;

  if (item.type === 'image') {
    return (
      <ResizableImage
        {...item}
        image={item}
        src={item.src}
        isSelected={selectedId === item.id}
        onSelect={() => setSelectedLayer(item)}
        onUnselect={() => setSelectedId(null)}
        showMask={showMask}
        updateToolbarButtonPosition={updateToolbarButtonPosition}
        isDraggable={isDraggable}
        key={`item_${sessionId}_${selectedFrameId}_${item.src}_${index}`}
        updateTargetActiveLayerConfig={updateTargetActiveLayerConfig}
        isLayerSeeking={isLayerSeeking}
      />
    );
  } else if (item.type === 'text') {
    return (
      <ResizableText
        {...item}
        isSelected={selectedId === item.id}
        onSelect={() => setSelectedLayer(item)}
        onUnselect={() => setSelectedId(null)}
        updateToolbarButtonPosition={updateToolbarButtonPosition}
        isDraggable={isDraggable}
        updateTargetActiveLayerConfig={updateTargetShapeActiveLayerConfig}
      />
    );
  } else if (item.type === 'shape') {
    if (item.shape === 'circle') {
      return (
        <ResizableCircle
          {...item}
          isSelected={selectedId === item.id}
          onSelect={() => selectLayer(item)}
          onUnselect={() => setSelectedId(null)}
          updateToolbarButtonPosition={updateToolbarButtonPosition}
          isDraggable={isDraggable}
          updateTargetActiveLayerConfig={updateTargetShapeActiveLayerConfig}
        />
      );
    } else if (item.shape === 'rectangle') {
      return (
        <ResizableRectangle
          config={item.config}
          {...item}
          isSelected={selectedId === item.id}
          onSelect={() => selectLayer(item)}
          onUnselect={() => setSelectedId(null)}
          updateToolbarButtonPosition={updateToolbarButtonPosition}
          isDraggable={isDraggable}
          updateTargetActiveLayerConfig={updateTargetShapeActiveLayerConfig}
        />
      );
    } else if (item.shape === 'polygon') {
      return (
        <ResizablePolygon
          {...item}
          isSelected={selectedId === item.id}
          onSelect={() => selectLayer(item)}
          onUnselect={() => setSelectedId(null)}
          updateToolbarButtonPosition={updateToolbarButtonPosition}
          isDraggable={isDraggable}
          updateTargetActiveLayerConfig={updateTargetShapeActiveLayerConfig}
        />
      );
    } else if (item.shape === 'dialog') {
      return (
        <ResizableDialogBubble
          {...item}
          isSelected={selectedId === item.id}
          onSelect={() => selectLayer(item)}
          onUnselect={() => setSelectedId(null)}
          updateToolbarButtonPosition={updateToolbarButtonPosition}
          onChange={(newAttrs) => onChange({ ...newAttrs, id: item.id })}
          updateTargetActiveLayerConfig={updateTargetShapeActiveLayerConfig}
        />
      );

    }
  }

}