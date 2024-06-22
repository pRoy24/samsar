import React, { forwardRef, useEffect, useState, useRef } from "react";
import { Stage, Layer, Group, Line, Circle, Rect, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import ResizableImage from "../../editor/ResizableImage.tsx";
import ResizableText from "../../editor/ResizableText.tsx";
import ResizableRectangle from "../../editor/shapes/ResizableRectangle.tsx";
import ResizablePolygon from "../../editor/shapes/ResizablePolygon.tsx";
import ResizableCircle from "../../editor/shapes/ResizableCircle.tsx";
import ResizableDialogBubble from "../../editor/shapes/ResizableDialogBubble.tsx";
import ImageToolbar from '../toolbars/ImageToolbar.js';
import ShapeSelectToolbar from '../toolbars/toolbar_shapes/ShapeSelectToolbar.js';
import { useColorMode } from '../../../contexts/ColorMode.js';
import { FaChevronCircleDown, FaChevronCircleUp } from "react-icons/fa";
import { CURRENT_TOOLBAR_VIEW, TOOLBAR_ACTION_VIEW } from '../../../constants/Types.ts';
import { STAGE_DIMENSIONS } from '../../../constants/Image.js';
import { generateCursor, generatePencilCursor } from "../util/GenerateSVG.js";
import EraserToolbar from "../toolbars/EraserToolbar.js";
import PaintToolbar from "../toolbars/PaintToolbar.js";
import DraggableToolbarRectangle from "../toolbars/toolbar_shapes/DraggableToolbarRectangle.js";
import DraggableToolbarCircle from "../toolbars/toolbar_shapes/DraggableToolbarCircle.js";
import { transformImageHorizontal, transformImageVertical } from "../util/ImageUtils.js";

const SELECTABLE_TYPES = ['SHOW_DEFAULT_DISPLAY', 'SHOW_CURSOR_SELECT_DISPLAY'];
const PROCESSOR_API_URL = process.env.REACT_APP_PROCESSOR_API;

const VideoCanvas = forwardRef((props: any, ref: any) => {
  const { sessionDetails, activeItemList, setActiveItemList, currentView,
    setCurrentView, editBrushWidth, editMasklines, setEditMaskLines, currentCanvasAction,
    setCurrentCanvasAction, setSelectedId, selectedId, buttonPositions,
    setButtonPositions, selectedLayerType, setSelectedLayerType, applyFilter,
    onChange, pencilColor, pencilWidth, eraserWidth, sessionId, selectedFrameId,
    exportAnimationFrames, currentLayer, currentLayerSeek, updateSessionActiveItemList,
    selectedLayerSelectShape, isLayerSeeking, applyFinalFilter,
  } = props;

  const [showMask, setShowMask] = useState(false);
  const [showEraser, setShowEraser] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const [showPencil, setShowPencil] = useState(false);
  const [pencilLines, setPencilLines] = useState([]);
  const [eraserLines, setEraserLines] = useState([]);
  const [eraserLayer, setEraserLayer] = useState(null);
  const [shapeSelectToolbarVisible, setShapeSelectToolbarVisible] = useState(false);
  const [shapeSelectToolbarPosition, setShapeSelectToolbarPosition] = useState({ x: 0, y: 0 });

  const [paintToolbarVisible, setPaintToolbarVisible] = useState(false);
  const [paintToolbarPosition, setPaintToolbarPosition] = useState({ x: 0, y: 0 });

  const [isShapeVisible, setIsShapeVisible] = useState(false);
  const [toolbarShapeProps, setToolbarShapeProps] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    radius: 0
  });

  const [shapeSet, setShapeSet] = useState(false);

  const showEraserRef = useRef(showEraser);
  const showPencilRef = useRef(showPencil);
  const editMasklinesRef = useRef(editMasklines);
  const eraserWidthRef = useRef(eraserWidth);
  const animationRefs = useRef({});
  const initialParamsRef = useRef({});
  const [hoveredObject, setHoveredObject] = useState(null);
  const [segmentation, setSegmentation] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);

  const [eraserToolbarVisible, setEraserToolbarVisible] = useState(false);
  const [eraserToolbarPosition, setEraserToolbarPosition] = useState({ x: 0, y: 0 });

  const [tempTopNode, setTempTopNode] = useState(null);




  useEffect(() => {
    initialParamsRef.current = {};
  }, [currentLayer]);


  useEffect(() => {
    showEraserRef.current = showEraser;
    showPencilRef.current = showPencil;
    editMasklinesRef.current = editMasklines;
    eraserWidthRef.current = eraserWidth;
  }, [showEraser, showPencil, editMasklines, eraserWidth]);

  useEffect(() => {
    const stage = ref.current.getStage();
    const container = stage.container();
    if (currentCanvasAction === 'MOVE') {
      container.style.cursor = 'grab';
    } else if (currentCanvasAction === 'RESIZE') {
      container.style.cursor = 'nwse-resize';
    } else if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_ERASER_DISPLAY) {
      container.style.cursor = generateCursor(eraserWidthRef.current);
    } else {
      container.style.cursor = 'default';
    }
  }, [currentCanvasAction]);

  useEffect(() => {
    const FPS = 30;
    const { duration, durationOffset } = currentLayer;
    const elapsedTime = currentLayerSeek / FPS;
    const stage = ref.current.getStage();
    const layer = stage.findOne("#baseGroup");
    if (!layer) return;
    activeItemList.forEach(item => {
      const node = layer.findOne(`#${item.id}`);
      if (node) {
        applyAnimationsToNode(node, item, elapsedTime, duration, durationOffset);
      }
    });
   // layer.draw();
  }, [currentLayerSeek, currentLayer, activeItemList]);

  const applyAnimationsToNode = (node, item, elapsedTime, duration, durationOffset) => {

    if (!item.animations) return;
    let isAnimating = false;
    const { x, y, width, height } = item;
    let requiresTranslation = false;
    let initialX = x;
    let initialY = y;
    // Check if translation is required
    item.animations?.forEach(animation => {
      if (animation.type === 'rotate') {
        requiresTranslation = true;
      }
    });

    if (requiresTranslation) {

    }



    item.animations.forEach(animation => {
      const { type, params } = animation;
      const startTime = (params.startTime || 0) + (durationOffset || 0);
      const endTime = (params.endTime || duration) + (durationOffset || 0);
      const animationElapsed = Math.max(0, Math.min(elapsedTime - startTime, endTime - startTime));

      if (animationElapsed >= 0 && animationElapsed <= (endTime - startTime)) {
        isAnimating = true;

        const { startX, endX, startY, endY , } = params;
        const totalDuration = endTime - startTime;

        let translateX = startX + (endX - startX) * (animationElapsed / totalDuration);
        let translateY = startY + (endY - startY) * (animationElapsed / totalDuration);

        switch (type) {
          case 'fade':
            node.opacity((params.startFade + (params.endFade - params.startFade) * animationElapsed / (endTime - startTime)) / 100);
            break;
          case 'slide':
            node.x(translateX);
            node.y(translateY);
            break;
          case 'zoom':
            node.scaleX((params.startScale + (params.endScale - params.startScale) * animationElapsed / (endTime - startTime)) / 100);
            node.scaleY((params.startScale + (params.endScale - params.startScale) * animationElapsed / (endTime - startTime)) / 100);
            break;
          case 'rotate':
            const rotationSpeed = params.rotationSpeed || 1;
            const totalDuration = endTime - startTime;
            const angle = (animationElapsed / totalDuration) * rotationSpeed * 360;
            node.rotation(angle);
            break;
          default:
            break;
        }
      }
    });

    if (!isAnimating && initialParamsRef.current[item.id]) {
      const { x, y, offsetX, offsetY } = initialParamsRef.current[item.id];
      // node.offsetX(offsetX);
      // node.offsetY(offsetY);
      // node.x(x);
      // node.y(y);
    }
  };


  useEffect(() => {
    const stage = ref.current.getStage();
    const positions = activeItemList.map(item => {
      const itemId = item.id.toString();
      const node = stage.findOne(`#${itemId}`);
      if (node) {
        const absPos = node.getClientRect({ skipTransform: false, skipShadow: false, skipStroke: false });
        return { id: item.id, x: absPos.x + 30, y: absPos.y };
      }
      return null;
    }).filter(Boolean);
    setButtonPositions(positions);
  }, [activeItemList, ref, selectedId]);

  const { colorMode } = useColorMode();
  const bgColor = colorMode === 'dark' ? `bg-gray-900` : `bg-neutral-300`;
  const textColor = colorMode === 'dark' ? `text-white` : `text-black`;

  const selectLayer = (item) => {
    if (item.config) setSelectedId(item.id);
  };

  useEffect(() => {
    setShowMask(false);
    setShowEraser(false);
    const stage = ref.current.getStage();
    const container = stage.container();
    if (currentView === CURRENT_TOOLBAR_VIEW.SHOW_EDIT_MASK_DISPLAY) {
      setShowMask(true);
      container.style.cursor = generateCursor(editBrushWidth);
    } else if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_ERASER_DISPLAY) {
      setShowEraser(true);
      container.style.cursor = generateCursor(eraserWidthRef.current);
    } else if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_PENCIL_DISPLAY) {
      setShowPencil(true);
      container.style.cursor = generatePencilCursor(20);
    } else {
      setEditMaskLines([]);
      container.style.cursor = 'default';
    }
  }, [currentView, currentCanvasAction]);

  useEffect(() => {
    if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_ERASER_DISPLAY) {
      const stage = ref.current.getStage();
      const container = stage.container();
      container.style.cursor = generateCursor(eraserWidth);
    }
  }, [eraserWidth]);

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (!document.getElementById('samsar-konva-stage').contains(e.target)) {
        // Handle the click outside event
      }
    };
    document.addEventListener('click', checkIfClickedOutside);
    return () => {
      document.removeEventListener('click', checkIfClickedOutside);
    };
  }, []);

  if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_ERASER_DISPLAY) {
    const stage = ref.current.getStage();
    const container = stage.container();
    container.style.cursor = generateCursor(eraserWidthRef.current);
  }

  if (currentView === CURRENT_TOOLBAR_VIEW.SHOW_EDIT_MASK_DISPLAY) {
    const stage = ref.current.getStage();
    const container = stage.container();
    container.style.cursor = generateCursor(editBrushWidth);
  }

  const moveItem = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= activeItemList.length) return; // Out of bounds, do nothing

    const newList = [...activeItemList];

    // Swap the items
    const temp = newList[newIndex];
    newList[newIndex] = newList[index];
    newList[index] = temp;

    // Swap their IDs
    const tempId = newList[newIndex].id;
    newList[newIndex].id = newList[index].id;
    newList[index].id = tempId;

    setActiveItemList(newList);
    updateSessionActiveItemList(newList); // Make sure to update the session active item list
  };

  const setSelectedLayer = (item) => {
    setSelectedId(item.id);
    if (item.type === 'image') {
      setSelectedLayerType('image');
    } else if (item.type === 'text') {
      setSelectedLayerType('text');
    } else if (item.type === 'shape') {
      setSelectedLayerType('shape');
    }
  };

  const updateToolbarButtonPosition = (id, x, y) => {
    setButtonPositions((prevPositions) =>
      prevPositions.map((pos) =>
        pos.id === id ? { ...pos, x: x + 30, y: y } : pos
      )
    );
  };

  const isDraggable = SELECTABLE_TYPES.includes(currentView);

  const flipImageHorizontal = (id) => {
    const stage = ref.current.getStage();
    const imageNode = stage.findOne(`#${id}`);
    if (!imageNode) {
      return;
    }
  
    // Flip the image horizontally
    imageNode.scaleX(imageNode.scaleX() * -1);
    stage.batchDraw();
  
    // Convert the updated image node to a data URL
    const updatedImageDataUrl = imageNode.toDataURL();
  
    // Update the activeItemList with the new data URL
    const updatedItemList = activeItemList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          src: updatedImageDataUrl,
        };
      }
      return item;
    });
  
    setActiveItemList(updatedItemList);
  
    // Send a backend request to update the session layer
    updateSessionActiveItemList(updatedItemList);
  };
  
  const flipImageVertical = (id) => {
    const stage = ref.current.getStage();
    const imageNode = stage.findOne(`#${id}`);
    if (!imageNode) {
      return;
    }
  
    // Flip the image vertically
    imageNode.scaleY(imageNode.scaleY() * -1);
    stage.batchDraw();
  
    // Convert the updated image node to a data URL
    const updatedImageDataUrl = imageNode.toDataURL();
  
    // Update the activeItemList with the new data URL
    const updatedItemList = activeItemList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          src: updatedImageDataUrl,
        };
      }
      return item;
    });
  
    setActiveItemList(updatedItemList);
  
    // Send a backend request to update the session layer
    updateSessionActiveItemList(updatedItemList);
  };
  
  const previousActionViewRef = useRef();

  useEffect(() => {
    if (previousActionViewRef.current === TOOLBAR_ACTION_VIEW.SHOW_ERASER_DISPLAY && currentCanvasAction !== TOOLBAR_ACTION_VIEW.SHOW_ERASER_DISPLAY) {
      setEraserToolbarPosition(null);
      setEraserToolbarVisible(false);
      replaceTopLayer();
    }
  }, [currentCanvasAction]);

  const replaceTopLayer = () => {
    const stage = ref.current.getStage();
    const layer1 = stage.children[1];
    if (layer1) {
      const eraserLayerImage = layer1.children[0];
      const eraserImageSrc = eraserLayerImage.attrs.src;
      const boundingBox = eraserLayerImage.getClientRect();
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = boundingBox.width;
      offscreenCanvas.height = boundingBox.height;
      const offscreenCtx = offscreenCanvas.getContext('2d');
      offscreenCtx.drawImage(
        layer1.toCanvas(),
        boundingBox.x, boundingBox.y,
        boundingBox.width, boundingBox.height,
        0, 0,
        boundingBox.width, boundingBox.height
      );
      const eraserShapes = eraserLayer.children.filter((child) => child.attrs.id === 'eraserCircle');
      eraserShapes.forEach(shape => {
        const shapeClientRect = shape.getClientRect();
        offscreenCtx.clearRect(
          shapeClientRect.x - boundingBox.x,
          shapeClientRect.y - boundingBox.y,
          shapeClientRect.width,
          shapeClientRect.height
        );
      });
      const dataURL = offscreenCanvas.toDataURL();
      const imageObj = new window.Image();
      imageObj.onload = () => {
        const newItem = {
          id: `item_${activeItemList.length - 1}`,
          type: 'image',
          src: dataURL,
          width: imageObj.width,
          height: imageObj.height,
          x: boundingBox.x,
          y: boundingBox.y,
        };
        const newActiveItemList = activeItemList.slice(0, -1).concat(newItem);
        setActiveItemList(newActiveItemList);
        eraserLayer.off();
        eraserLayer.destroy();
        setEraserLayer(null);
        updateSessionActiveItemList(newActiveItemList);

        setSelectedId(null); /// CHECK THIS


      };
      imageObj.src = dataURL;
    }
  }

  const duplicateTopLayer = () => {
    const stage = ref.current.getStage();
    const layer0 = stage.children[0];
    if (eraserLayer) {
      const boundingBox = eraserLayer.getClientRect();
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = boundingBox.width;
      offscreenCanvas.height = boundingBox.height;
      const offscreenCtx = offscreenCanvas.getContext('2d');
      offscreenCtx.drawImage(
        stage.toCanvas(),
        boundingBox.x, boundingBox.y,
        boundingBox.width, boundingBox.height,
        0, 0,
        boundingBox.width, boundingBox.height
      );
      const eraserShapes = eraserLayer.children.filter((child) => child.attrs.id === 'eraserCircle');
      eraserShapes.forEach(shape => {
        const shapeClientRect = shape.getClientRect();
        offscreenCtx.clearRect(
          shapeClientRect.x - boundingBox.x,
          shapeClientRect.y - boundingBox.y,
          shapeClientRect.width,
          shapeClientRect.height
        );
      });
      const dataURL = offscreenCanvas.toDataURL();
      const imageObj = new window.Image();
      imageObj.onload = () => {
        const newItem = {
          id: `item_${activeItemList.length}`,
          type: 'image',
          src: dataURL,
          width: imageObj.width,
          height: imageObj.height,
          x: boundingBox.x,
          y: boundingBox.y,
        };
        const newActiveItemList = [...activeItemList, newItem];
        setActiveItemList(newActiveItemList);
        updateSessionActiveItemList(newActiveItemList);
        eraserLayer.off();
        eraserLayer.destroy();
        setEraserLayer(null);
      };
      imageObj.src = dataURL;
    }
  }

  const replaceEraserImage = () => {
    replaceTopLayer();
    setEraserToolbarVisible(false);
  }

  const duplicateEraserImage = () => {
    duplicateTopLayer();
    setEraserToolbarVisible(false);
  }

  const resetEraserImage = () => {
    const stage = ref.current.getStage();
    if (eraserLayer) {
      eraserLayer.destroy();
      setEraserLayer(null);
      if (tempTopNode) {
        const layer = stage.findOne('#baseGroup');
        layer.add(tempTopNode);
        tempTopNode.show();
        setTempTopNode(null);
        layer.draw();
      }
    }
    setEraserToolbarVisible(false);
  };

  useEffect(() => {
    if (previousActionViewRef.current === CURRENT_TOOLBAR_VIEW.SHOW_PENCIL_DISPLAY && currentView !== CURRENT_TOOLBAR_VIEW.SHOW_PENCIL_DISPLAY) {
      const stage = ref.current.getStage();
      const pencilGroup = stage.findOne('#pencilGroup');
      if (pencilGroup) {
        const dataURL = pencilGroup.toDataURL();
        const imageObj = new window.Image();
        imageObj.onload = () => {
          const groupClientRect = pencilGroup.getClientRect();
          const newItem = {
            id: `item_${activeItemList.length}`,
            type: 'image',
            src: dataURL,
            x: groupClientRect.x,
            y: groupClientRect.y,
            width: groupClientRect.width,
            height: groupClientRect.height,
          };
          const newItemList = [...activeItemList, newItem];
          setActiveItemList(newItemList);
          pencilGroup.off();
          pencilGroup.destroy();
          setShowPencil(false);
          updateSessionActiveItemList(newItemList)
        };
        imageObj.src = dataURL;
      }
    }
    if (previousActionViewRef.current !== currentCanvasAction) {
      previousActionViewRef.current = currentCanvasAction;
    }
  }, [currentCanvasAction, currentView]);

  const previousViewRef = useRef();

  useEffect(() => {
    if (previousViewRef.current === CURRENT_TOOLBAR_VIEW.SHOW_ACTIONS_DISPLAY && currentView !== CURRENT_TOOLBAR_VIEW.SHOW_ACTIONS_DISPLAY) {
      setCurrentCanvasAction(null);
    }
    previousViewRef.current = currentView;
  }, [currentView]);

  const addLine = (points) => {
    setEditMaskLines([...editMasklines, { points, stroke: 'white', strokeWidth: editBrushWidth }]);
  };

  const handleLayerMouseDown = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (currentView === CURRENT_TOOLBAR_VIEW.SHOW_SELECT_DISPLAY && (selectedLayerSelectShape === 'rectangle' || selectedLayerSelectShape === 'circle')) {

      if (!shapeSet) {
        startPosRef.current = point;
        setIsDrawing(true);
        setToolbarShapeProps({ x: point.x, y: point.y, radius: 0 });
      }

    } else if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_ERASER_DISPLAY) {
      const point = stage.getPointerPosition();
      const topShape = stage.getIntersection(point);
      if (topShape) {
        const topItemParentId = topShape.getParent().attrs.id;
        const topItemParentNode = stage.findOne(`#${topItemParentId}`);
        if (topItemParentNode) {
          let newEraserLayer;
          if (eraserLayer) {
            newEraserLayer = eraserLayer;
          } else {
            newEraserLayer = new Konva.Layer();
            const clonedItem = topItemParentNode.clone();
            clonedItem.attrs.id = 'originalShape';
            clonedItem.hide();
            setTempTopNode(topItemParentNode.clone());
            topItemParentNode.destroy();
            const clonedItemChild = clonedItem.children[0];
            newEraserLayer.add(clonedItemChild);
            stage.add(newEraserLayer);
            setEraserLayer(newEraserLayer);
          }
          setHandlersForLayer(newEraserLayer);
          newEraserLayer.on('mousedown', () => {
            if (showEraserRef.current) setHandlersForLayer(newEraserLayer);
            setEraserToolbarPosition(null);
            setEraserToolbarVisible(false);
          });

          function setHandlersForLayer(newEraserLayer) {
            newEraserLayer.on('mousemove', (e) => {
              const eraserRadius = eraserWidthRef.current ? eraserWidthRef.current / 2 : eraserWidth / 2;
              const point = stage.getPointerPosition();
              const eraserShape = new Konva.Circle({
                x: point.x,
                y: point.y,
                radius: eraserRadius / 2,
                fill: 'black',
                globalCompositeOperation: 'destination-out',
                id: 'eraserCircle'
              });
              newEraserLayer.add(eraserShape);
              newEraserLayer.batchDraw();
            });
            newEraserLayer.on('mouseup', () => {
              const boundingBox = newEraserLayer.getClientRect();
              setEraserToolbarPosition({ x: boundingBox.x, y: boundingBox.y + 50 });
              setEraserToolbarVisible(true);
              setIsPainting(false);
              setEraserLayer(newEraserLayer);
              newEraserLayer.off('mousemove');
              newEraserLayer.off('mouseup');
            });
          }
        }
      }
    } else if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_PENCIL_DISPLAY) {
      setIsPainting(true);
      setPaintToolbarVisible(false);
      const pos = e.target.getStage().getPointerPosition();
      setPencilLines([...pencilLines, { points: [pos.x, pos.y], stroke: pencilColor, strokeWidth: pencilWidth }]);
    } else {
      setIsPainting(true);
      const pos = e.target.getStage().getPointerPosition();
      addLine([pos.x, pos.y, pos.x, pos.y]);
    }
  };

  const handleLayerMouseMove = (e) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    if (isDrawing && !shapeSet) {
      const startX = startPosRef.current.x;
      const startY = startPosRef.current.y;

      if (selectedLayerSelectShape === 'rectangle') {
        const newProps = {
          ...toolbarShapeProps,
          x: Math.min(startX, pointerPosition.x),
          y: Math.min(startY, pointerPosition.y),
          width: Math.abs(pointerPosition.x - startX),
          height: Math.abs(pointerPosition.y - startY),
        };
        setToolbarShapeProps(newProps);
      } else if (selectedLayerSelectShape === 'circle') {
        const newProps = {
          ...toolbarShapeProps,
          x: startX,
          y: startY,
          radius: Math.sqrt(
            (pointerPosition.x - startX) ** 2 + (pointerPosition.y - startY) ** 2
          ),
        };
        setToolbarShapeProps(newProps);
      }

      return;
    }
    if (!isPainting) return;
    const point = stage.getPointerPosition();
    if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_ERASER_DISPLAY && eraserLayer) {
      const eraserRadius = eraserWidthRef.current ? eraserWidthRef.current / 2 : eraserWidth / 2;
      const eraserShape = new Konva.Circle({
        x: point.x,
        y: point.y,
        radius: eraserRadius,
        fill: 'black',
        globalCompositeOperation: 'destination-out'
      });
      eraserLayer.add(eraserShape);
      eraserLayer.batchDraw();
    } else if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_PENCIL_DISPLAY) {
      let lastLine = pencilLines[pencilLines.length - 1];
      if (lastLine) {
        lastLine.points = lastLine.points.concat([point.x, point.y]);
        setPencilLines(pencilLines.slice(0, -1).concat(lastLine));
      }
    } else if (editMasklinesRef.current.length > 0) {
      let lastLine = editMasklinesRef.current[editMasklinesRef.current.length - 1];
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      setEditMaskLines(editMasklinesRef.current.slice(0, -1).concat(lastLine));
    }
  };

  const handleLayerMouseUp = () => {
    setIsPainting(false);
    setIsDrawing(false);

    if (currentView === CURRENT_TOOLBAR_VIEW.SHOW_SELECT_DISPLAY && (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_SELECT_SHAPE_DISPLAY)) {
      const stage = ref.current.getStage();
      const layer = stage.findOne('#shapeSelectToolbar');
      if (layer) {

        let newYPos = layer.attrs.y > 40 ? layer.attrs.y - 40 : layer.attrs.y;
        setShapeSelectToolbarVisible(true);
        setShapeSelectToolbarPosition({ x: layer.attrs.x, y: newYPos });
        if (toolbarShapeProps.radius > 0 || toolbarShapeProps.width > 0 || toolbarShapeProps.height > 0) {
          setShapeSet(true);
        }

      }
    }

    if (currentView === CURRENT_TOOLBAR_VIEW.SHOW_ACTIONS_DISPLAY && currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_PENCIL_DISPLAY) {
      setPaintToolbarVisible(true);
      setPaintToolbarPosition({ x: toolbarShapeProps.x, y: toolbarShapeProps.y + 40 });
    }
  };

  const shapeSelectTransformerCircleRef = useRef();
  const shapeSelectTransformerRectangleRef = useRef();


  const onCopyShapeLayer = () => {
    setIsShapeVisible(false);
    setShapeSelectToolbarVisible(false);
    const stage = ref.current.getStage();
    const shape = stage.findOne("#shapeSelectToolbar");
    let transformer;
    if (shape) {
      if (shape.attrs.type === 'circle') {
        transformer = shapeSelectTransformerCircleRef.current; // Add this line to get transformer reference
      } else if (shape.attrs.type === 'rectangle') {
        transformer = shapeSelectTransformerRectangleRef.current; // Add this line to get transformer reference
      }
      if (transformer) {
        transformer.hide(); // Hide transformer boundaries
      }
      const boundingBox = shape.getClientRect();
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = boundingBox.width;
      offscreenCanvas.height = boundingBox.height;
      const offscreenCtx = offscreenCanvas.getContext('2d');
      shape.hide();
      offscreenCtx.drawImage(
        stage.toCanvas(),
        boundingBox.x, boundingBox.y,
        boundingBox.width, boundingBox.height,
        0, 0,
        boundingBox.width, boundingBox.height
      );
      if (shape.attrs.type === 'circle') {
        const shapeRadius = shape.attrs.radius;
        const centerX = boundingBox.width / 2;
        const centerY = boundingBox.height / 2;
        const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        const data = imageData.data;
        for (let y = 0; y < offscreenCanvas.height; y++) {
          for (let x = 0; x < offscreenCanvas.width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > shapeRadius) {
              const index = (y * offscreenCanvas.width + x) * 4;
              data[index + 3] = 0;
            }
          }
        }
        offscreenCtx.putImageData(imageData, 0, 0);
      }
      const dataURL = offscreenCanvas.toDataURL();
      const imageObj = new window.Image();
      imageObj.onload = () => {
        const newItem = {
          id: `item_${activeItemList.length}`,
          type: 'image',
          src: dataURL,
          width: imageObj.width,
          height: imageObj.height,
          x: boundingBox.x,
          y: boundingBox.y,
        };
        const newActiveItemList = [...activeItemList, newItem];
        setActiveItemList(newActiveItemList);
        updateSessionActiveItemList(newActiveItemList);
        if (transformer) {
          transformer.show(); // Show transformer boundaries again
        }
      };
      imageObj.src = dataURL;
    }
  };


  const onReplaceShapeLayer = () => {
    setIsShapeVisible(false);
    setShapeSelectToolbarVisible(false);
    const stage = ref.current.getStage();
    const shape = stage.findOne("#shapeSelectToolbar");
    let transformer;

    if (shape) {

      if (shape.attrs.type === 'circle') {
        transformer = shapeSelectTransformerCircleRef.current; // Add this line to get transformer reference
      } else if (shape.attrs.type === 'rectangle') {
        transformer = shapeSelectTransformerRectangleRef.current; // Add this line to get transformer reference
      }
      if (transformer) {
        transformer.hide(); // Hide transformer boundaries
      }
      const boundingBox = shape.getClientRect();
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = boundingBox.width;
      offscreenCanvas.height = boundingBox.height;
      const offscreenCtx = offscreenCanvas.getContext('2d');
      shape.hide();
      offscreenCtx.drawImage(
        stage.toCanvas(),
        boundingBox.x, boundingBox.y,
        boundingBox.width, boundingBox.height,
        0, 0,
        boundingBox.width, boundingBox.height
      );
      if (shape.attrs.type === 'circle') {
        const shapeRadius = shape.attrs.radius;
        const centerX = boundingBox.width / 2;
        const centerY = boundingBox.height / 2;
        const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        const data = imageData.data;
        for (let y = 0; y < offscreenCanvas.height; y++) {
          for (let x = 0; x < offscreenCanvas.width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > shapeRadius) {
              const index = (y * offscreenCanvas.width + x) * 4;
              data[index + 3] = 0;
            }
          }
        }
        offscreenCtx.putImageData(imageData, 0, 0);
      }
      const dataURL = offscreenCanvas.toDataURL();
      const imageObj = new window.Image();
      imageObj.onload = () => {
        const newItem = {
          id: `item_${activeItemList.length -1}`,
          type: 'image',
          src: dataURL,
          width: imageObj.width,
          height: imageObj.height,
          x: boundingBox.x,
          y: boundingBox.y,
        };

        let prevActiveList = [...activeItemList];
        prevActiveList[prevActiveList.length - 1] = newItem;
        setActiveItemList(prevActiveList);
        updateSessionActiveItemList(prevActiveList);
        if (transformer) {
          transformer.show(); // Show transformer boundaries again
        }
        setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
      };
      imageObj.src = dataURL;
    }
  };


  const handleResetShapeLayer = () => {
    setIsShapeVisible(false);
    setShapeSelectToolbarVisible(false);
  };

  const removeItem = (index) => {
    const newList = [...activeItemList];
    newList.splice(index, 1);
    setActiveItemList(newList);
    updateSessionActiveItemList(newList);
  }

  const updateTargetActiveLayerConfig = (id, newConfig) => {
    const newActiveItemList = activeItemList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...newConfig,
        };
      }
      return item;
    });
    setActiveItemList(newActiveItemList);    
    updateSessionActiveItemList(newActiveItemList);
  }

  const updateTargetShapeActiveLayerConfig = (id, newConfig) => {

    const newActiveItemList = activeItemList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          config: {
            ...item.config,
            ...newConfig,
          },
        };
      }
      return item;
    });

    setActiveItemList(newActiveItemList);
    updateSessionActiveItemList(newActiveItemList);
  }

  const addPaintImage = () => {
    const stage = ref.current.getStage();
    const pencilGroup = stage.findOne('#pencilGroup');
    if (pencilGroup) {
      const dataURL = pencilGroup.toDataURL();
      const imageObj = new window.Image();
      imageObj.onload = () => {
        const groupClientRect = pencilGroup.getClientRect();
        const newItem = {
          id: `item_${activeItemList.length}`,
          type: 'image',
          src: dataURL,
          x: groupClientRect.x,
          y: groupClientRect.y,
          width: groupClientRect.width,
          height: groupClientRect.height,
        };
        const newItemList = [...activeItemList, newItem];
        setActiveItemList(newItemList);
        pencilGroup.off();
        pencilGroup.destroy();
        setShowPencil(false);
        updateSessionActiveItemList(newItemList);
      };
      imageObj.src = dataURL;
      setCurrentCanvasAction(TOOLBAR_ACTION_VIEW.SHOW_PENCIL_DISPLAY);
      setPaintToolbarVisible(false);
      setCurrentView(CURRENT_TOOLBAR_VIEW.SHOW_DEFAULT_DISPLAY);
    }
  };

  const resetPaintImage = () => {
    const stage = ref.current.getStage();
    const paintLayer = stage.findOne('#pencilGroup');
    if (paintLayer) {
      paintLayer.destroyChildren();
      paintLayer.draw();
    }
    setPaintToolbarVisible(false);
  };

  let imageStackList = <span />;
  if (activeItemList && activeItemList.length > 0) {
    imageStackList = activeItemList.map((item, index) => {
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
    }).filter(Boolean);
  }

  useEffect(() => {
    const stage = ref.current.getStage();
    const layer = stage.findOne("#baseGroup");
    if (!layer) return;

    activeItemList.forEach((item) => {
      const node = layer.findOne(`#${item.id}`);
      if (node && selectedId === item.id) {
        const absPos = node.getClientRect({ skipTransform: false, skipShadow: false, skipStroke: false });
        if (selectedLayerType === 'shape') {

        } else if (selectedLayerType === 'image' && currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_ERASER_DISPLAY) {
          //   setEraserToolbarPosition({ x: absPos.x, y: absPos.y + 50 });
        } else if (selectedLayerType === 'image' && currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_PENCIL_DISPLAY) {
          // setPaintToolbarPosition({ x: absPos.x, y: absPos.y + 40 });
        }
      }
    });
  }, [selectedId, selectedLayerType, currentCanvasAction, activeItemList, ref]);

  let currentShapeSelectDisplay = null;

  if (currentView === CURRENT_TOOLBAR_VIEW.SHOW_SELECT_DISPLAY) {

    if (currentCanvasAction === TOOLBAR_ACTION_VIEW.SHOW_SELECT_OBJECT_DISPLAY) {

    }
    if (selectedLayerSelectShape === 'circle') {
      currentShapeSelectDisplay = (
        <DraggableToolbarCircle
          shapeProps={toolbarShapeProps}
          setShapeProps={setToolbarShapeProps}
          id="shapeSelectToolbar"
          isDrawing={isDrawing}
          shapeSet={shapeSet}
          transformerRef={shapeSelectTransformerCircleRef}

        />)
    } else if (selectedLayerSelectShape === 'rectangle') {
      currentShapeSelectDisplay = (
        <DraggableToolbarRectangle
          shapeProps={toolbarShapeProps}
          setShapeProps={setToolbarShapeProps}
          id="shapeSelectToolbar"
          isDrawing={isDrawing}
          shapeSet={shapeSet}
          transformerRef={shapeSelectTransformerRectangleRef}
        />
      );
    }
  }

  if (ref.current) {
    const stage = ref.current.getStage();

  }

  return (
    <div className={`m-auto relative ${bgColor} ${textColor} pb-8 shadow-lg pt-[60px]`}>
      <Stage width={STAGE_DIMENSIONS.width} height={STAGE_DIMENSIONS.height} ref={ref} id="samsar-konva-stage">
        <Layer onMouseDown={handleLayerMouseDown} onMouseMove={handleLayerMouseMove} onMouseUp={handleLayerMouseUp}>
          <Group id="baseGroup">
            {imageStackList}
          </Group>
          {showMask && (
            <Group id="maskGroup">
              {editMasklines.map((line, i) => (
                <Line key={i} points={line.points} stroke={line.stroke} strokeWidth={line.strokeWidth} />
              ))}
            </Group>
          )}
          {showPencil && (
            <Group id="pencilGroup">
              {pencilLines.map((line, i) => (
                <Line key={i} points={line.points} stroke={line.stroke} strokeWidth={line.strokeWidth} />
              ))}
            </Group>
          )}
          {overlayImage && (
            <KonvaImage
              image={overlayImage}
              x={0}
              y={0}
              width={STAGE_DIMENSIONS.width}
              height={STAGE_DIMENSIONS.height}
              opacity={0.6}
            />
          )}
          {currentShapeSelectDisplay}
        </Layer>
      </Stage>
      {buttonPositions.map((pos, index) => {
        if (!selectedId || (selectedId && pos.id && ((selectedId !== pos.id)))) return null;
        if (selectedLayerType === 'image') {
          return (
            <ImageToolbar
            key={pos.id}
            pos={pos}
            index={index}
            moveItem={moveItem}
            applyFilter={applyFilter}
            applyFinalFilter={applyFinalFilter}
            colorMode={colorMode}
            removeItem={removeItem}
            itemId={selectedId}
            flipImageHorizontal={flipImageHorizontal}
            flipImageVertical={flipImageVertical}
            updateTargetActiveLayerConfig={updateTargetActiveLayerConfig} // Pass the handler
            activeItemList={activeItemList} // Pass active item list to fetch current item properties
          />
          );
        }
        return (
          <div key={pos.id} style={{
            position: 'absolute', left: pos.x, top: pos.y, background: "#030712",
            width: "100px", borderRadius: "5px", padding: "5px", display: "flex", justifyContent: "center",
            zIndex: 1000
          }}>
            <button onClick={() => moveItem(index, -1)}>
              <FaChevronCircleDown className="text-white" />
            </button>
            <button onClick={() => moveItem(index, 1)} style={{ marginLeft: '10px' }}>
              <FaChevronCircleUp className="text-white" />
            </button>
          </div>
        );
      })}
      {eraserToolbarVisible && (
        <EraserToolbar
          pos={eraserToolbarPosition}
          replaceEraserImage={replaceEraserImage}
          duplicateEraserImage={duplicateEraserImage}
          resetEraserImage={resetEraserImage}
        />
      )}
      {shapeSelectToolbarVisible && (
        <ShapeSelectToolbar
          pos={shapeSelectToolbarPosition}
          onResetShape={handleResetShapeLayer}
          onCopyShape={onCopyShapeLayer}
          onReplaceShape={onReplaceShapeLayer}
        />
      )}
      {paintToolbarVisible && (
        <PaintToolbar
          pos={paintToolbarPosition}
          addPaintImage={addPaintImage}
          resetPaintImage={resetPaintImage}
        />
      )}
    </div>
  );
});

export default VideoCanvas;
