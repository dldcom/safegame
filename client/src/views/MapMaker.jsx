import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TILE_SIZE = 32;
const MAP_WIDTH = 50;
const MAP_HEIGHT = 50;

const MapMaker = () => {
    const navigate = useNavigate();
    const [selectedLayer, setSelectedLayer] = useState('background');
    const [selectedStage, setSelectedStage] = useState('stage_3'); // Default target
    const [selection, setSelection] = useState({ gids: [[1]], width: 1, height: 1 });
    const [activeTileset, setActiveTileset] = useState('Wall');
    const [showGrid, setShowGrid] = useState(true);
    const [isDrawing, setIsDrawing] = useState(false);
    const [history, setHistory] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');

    const [paletteSelectStart, setPaletteSelectStart] = useState(null);
    const [paletteSelectionRect, setPaletteSelectionRect] = useState(null);

    const [mapData, setMapData] = useState({
        background: Array(MAP_WIDTH * MAP_HEIGHT).fill(9287),
        middleground: Array(MAP_WIDTH * MAP_HEIGHT).fill(0),
        foreground: Array(MAP_WIDTH * MAP_HEIGHT).fill(0),
        spawns: [{ id: 1, name: 'playerspawn', x: 200, y: 200 }]
    });

    const tilesets = {
        'Wall': { firstgid: 1, columns: 25, src: '/assets/tilesets/Wall.png', total: 8025, width: 800, height: 10272 },
        'Floor2': { firstgid: 8026, columns: 60, src: '/assets/tilesets/Floor2.png', total: 8160, width: 1920, height: 4352 },
        'Exterior_Wall': { firstgid: 16186, columns: 156, src: '/assets/tilesets/Exterior_Wall.png', total: 31200, width: 4992, height: 6400 }
    };

    const pushToHistory = () => {
        setHistory(prev => {
            const newHistory = [...prev, JSON.parse(JSON.stringify(mapData))];
            if (newHistory.length > 30) newHistory.shift();
            return newHistory;
        });
    };

    const handleUndo = () => {
        setHistory(prev => {
            if (prev.length === 0) return prev;
            const newHistory = [...prev];
            const prevState = newHistory.pop();
            setMapData(prevState);
            return newHistory;
        });
    };

    const handleCellAction = (index) => {
        const startX = index % MAP_WIDTH;
        const startY = Math.floor(index / MAP_WIDTH);
        const newMapData = { ...mapData };
        const newLayerData = [...newMapData[selectedLayer]];
        let changed = false;

        for (let row = 0; row < selection.height; row++) {
            for (let col = 0; col < selection.width; col++) {
                const targetX = startX + col;
                const targetY = startY + row;
                if (targetX < MAP_WIDTH && targetY < MAP_HEIGHT) {
                    const targetIndex = targetY * MAP_WIDTH + targetX;
                    const gid = selection.gids[row][col];
                    if (newLayerData[targetIndex] !== gid) {
                        newLayerData[targetIndex] = gid;
                        changed = true;
                    }
                }
            }
        }
        if (changed) {
            newMapData[selectedLayer] = newLayerData;
            setMapData(newMapData);
        }
    };

    const handleMouseDown = (index) => {
        pushToHistory();
        setIsDrawing(true);
        handleCellAction(index);
    };

    const handleMouseEnter = (index) => {
        if (isDrawing) handleCellAction(index);
    };

    const handlePaletteMouseDown = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
        const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
        setPaletteSelectStart({ x, y });
        setPaletteSelectionRect({ x, y, w: 1, h: 1 });
    };

    const handlePaletteMouseMove = (e) => {
        if (!paletteSelectStart) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const currX = Math.floor((e.clientX - rect.left) / TILE_SIZE);
        const currY = Math.floor((e.clientY - rect.top) / TILE_SIZE);
        const x = Math.min(paletteSelectStart.x, currX);
        const y = Math.min(paletteSelectStart.y, currY);
        const w = Math.abs(paletteSelectStart.x - currX) + 1;
        const h = Math.abs(paletteSelectStart.y - currY) + 1;
        setPaletteSelectionRect({ x, y, w, h });
    };

    const handlePaletteMouseUp = () => {
        if (!paletteSelectionRect) return;
        const { x, y, w, h } = paletteSelectionRect;
        const ts = tilesets[activeTileset];
        const gids = [];
        for (let r = 0; r < h; r++) {
            const rowGids = [];
            for (let c = 0; c < w; c++) {
                rowGids.push(ts.firstgid + (y + r) * ts.columns + (x + c));
            }
            gids.push(rowGids);
        }
        setSelection({ gids, width: w, height: h });
        setPaletteSelectStart(null);
    };

    const getTileInfo = (gid) => {
        if (gid === 0) return null;
        if (gid >= 16186) return { name: 'Exterior_Wall', ...tilesets['Exterior_Wall'] };
        if (gid >= 8026) return { name: 'Floor2', ...tilesets['Floor2'] };
        return { name: 'Wall', ...tilesets['Wall'] };
    };

    const generateTiledJson = () => ({
        compressionlevel: -1,
        height: MAP_HEIGHT,
        infinite: false,
        layers: [
            { data: mapData.background, height: MAP_HEIGHT, id: 1, name: "background", opacity: 1, type: "tilelayer", visible: true, width: MAP_WIDTH, x: 0, y: 0 },
            { data: mapData.middleground, height: MAP_HEIGHT, id: 2, name: "middleground", opacity: 1, type: "tilelayer", visible: true, width: MAP_WIDTH, x: 0, y: 0 },
            { data: mapData.foreground, height: MAP_HEIGHT, id: 3, name: "foreground", opacity: 1, type: "tilelayer", visible: true, width: MAP_WIDTH, x: 0, y: 0 }
        ],
        orientation: "orthogonal",
        tileheight: 32,
        tilewidth: 32,
        tilesets: Object.keys(tilesets).map(name => ({
            columns: tilesets[name].columns,
            firstgid: tilesets[name].firstgid,
            image: `/assets/tilesets/${name}.png`,
            imageheight: tilesets[name].height,
            imagewidth: tilesets[name].width,
            name: name,
            margin: 0,
            spacing: 0,
            tilecount: tilesets[name].total,
            tileheight: 32, tilewidth: 32
        })),
        width: MAP_WIDTH
    });

    const exportToJson = () => {
        const tiledJson = generateTiledJson();
        const blob = new Blob([JSON.stringify(tiledJson, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedStage}.json`;
        a.click();
    };

    const saveToServer = async () => {
        setStatusMessage('저장 중...');
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const tiledJson = generateTiledJson();

            const response = await fetch('/api/map/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mapId: selectedStage,
                    title: `${selectedStage} 커스텀 맵`,
                    author: user.username || '관리자',
                    content: tiledJson
                })
            });

            if (response.ok) {
                setStatusMessage('성공적으로 저장되었습니다!');
                setTimeout(() => setStatusMessage(''), 3000);
            } else {
                setStatusMessage('저장 실패.');
            }
        } catch (error) {
            console.error('Save Error:', error);
            setStatusMessage('서버 오류 발생.');
        }
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => { setIsDrawing(false); setPaletteSelectStart(null); };
        const handleKeyDown = (e) => { if (e.ctrlKey && e.key === 'z') { e.preventDefault(); handleUndo(); } };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        window.addEventListener('keydown', handleKeyDown);
        return () => { window.removeEventListener('mouseup', handleGlobalMouseUp); window.removeEventListener('keydown', handleKeyDown); };
    }, [history, mapData]);

    return (
        <div className="map-maker-root">
            <sidebar className="mm-sidebar">
                <div className="mm-logo-area">
                    <h2 onClick={() => navigate('/teacher')} className="ed-logo clickable">Sage.</h2>
                    <span className="ed-logo-sub">Map Logic Console</span>
                </div>

                <div className="mm-layer-section">
                    <label className="mm-label">적용 대상 스테이지</label>
                    <select className="mm-stage-select" value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)}>
                        <option value="stage_1">Stage 1 (화상 안전)</option>
                        <option value="stage_2">Stage 2 (화재 안전)</option>
                        <option value="stage_3">Stage 3 (자연재해 안전)</option>
                    </select>

                    <label className="mm-label" style={{ marginTop: '20px' }}>편집 레이어</label>
                    <div className="mm-layer-grid">
                        {['background', 'middleground', 'foreground'].map(l => (
                            <button key={l} className={`mm-layer-chip ${selectedLayer === l ? 'active' : ''}`} onClick={() => setSelectedLayer(l)}>
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mm-tileset-section">
                    <label className="mm-label">타일셋 라이브러리 (드래그하여 여러 개 선택 가능)</label>
                    <div className="mm-tileset-tabs">
                        {Object.keys(tilesets).map(name => (
                            <button key={name} className={`mm-ts-tab ${activeTileset === name ? 'active' : ''}`} onClick={() => setActiveTileset(name)}>
                                {name}
                            </button>
                        ))}
                    </div>

                    <div className="mm-visual-palette-container">
                        <div className="mm-visual-palette" onMouseDown={handlePaletteMouseDown} onMouseMove={handlePaletteMouseMove} onMouseUp={handlePaletteMouseUp}>
                            <img src={tilesets[activeTileset].src} alt="palette" draggable="false" />
                            {paletteSelectionRect && (
                                <div className="mm-palette-selection-rect" style={{
                                    left: paletteSelectionRect.x * 32, top: paletteSelectionRect.y * 32,
                                    width: paletteSelectionRect.w * 32, height: paletteSelectionRect.h * 32
                                }} />
                            )}
                            {!paletteSelectionRect && selection.gids[0][0] >= tilesets[activeTileset].firstgid && selection.gids[0][0] < tilesets[activeTileset].firstgid + 40000 && (
                                <div className="mm-palette-selection" style={{
                                    left: ((selection.gids[0][0] - tilesets[activeTileset].firstgid) % tilesets[activeTileset].columns) * 32,
                                    top: Math.floor((selection.gids[0][0] - tilesets[activeTileset].firstgid) / tilesets[activeTileset].columns) * 32,
                                    width: selection.width * 32, height: selection.height * 32
                                }} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="mm-tool-box">
                    <div className="mm-selected-preview">
                        <label className="mm-label">현재 선택된 도구 ({selection.width}x{selection.height})</label>
                        <div className="mm-preview-container">
                            {selection.gids[0][0] === 0 ? (<div className="mm-preview-tile eraser">✕</div>) : (
                                <div className="mm-preview-grid" style={{ gridTemplateColumns: `repeat(${selection.width}, 16px)`, transform: 'scale(0.8)', transformOrigin: 'left top' }}>
                                    {selection.gids.flat().map((gid, i) => {
                                        const ts = getTileInfo(gid);
                                        const localI = gid - ts.firstgid;
                                        return (<div key={i} className="mm-preview-tile-small" style={{ backgroundImage: `url(${ts.src})`, backgroundPosition: `-${(localI % ts.columns) * 32}px -${Math.floor(localI / ts.columns) * 32}px`, backgroundSize: `${ts.columns * 32}px auto` }} />);
                                    })}
                                </div>
                            )}
                            <div className="mm-preview-info">
                                <span className="mm-tile-gid">Size: {selection.width}x{selection.height}</span>
                                <span className="mm-tile-name">{selection.gids[0][0] === 0 ? '지우개' : '멀티 타일'}</span>
                            </div>
                        </div>
                    </div>

                    <button className={`mm-tool-btn ${selection.gids[0][0] === 0 ? 'active' : ''}`} onClick={() => setSelection({ gids: [[0]], width: 1, height: 1 })}>지우개 (Eraser)</button>
                    <div className="mm-save-actions">
                        <button className="mm-export-btn secondary" onClick={exportToJson}>JSON 다운로드</button>
                        <button className="mm-export-btn" onClick={saveToServer}>DB에 즉시 저장</button>
                    </div>
                    {statusMessage && <p className="mm-status">{statusMessage}</p>}
                </div>
            </sidebar>

            <main className="mm-canvas-area">
                <header className="mm-canvas-header">
                    <div className="title-group">
                        <h1 className="serif-title">{selectedStage} 설계 평면도.</h1>
                        <p>타일을 선택하여 맵을 완성하세요. (드래그하여 그리기 가능)</p>
                    </div>
                    <div className="canvas-settings">
                        <label><input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} /> 격자 표시</label>
                    </div>
                </header>
                <div className="editor-view"><div className="canvas-frame">
                    <div className="map-grid" style={{ gridTemplateColumns: `repeat(${MAP_WIDTH}, 32px)` }}>
                        {Array.from({ length: MAP_WIDTH * MAP_HEIGHT }).map((_, i) => (
                            <div key={i} className={`map-cell ${showGrid ? 'grid' : ''}`} onMouseDown={() => handleMouseDown(i)} onMouseEnter={() => handleMouseEnter(i)}>
                                {['background', 'middleground', 'foreground'].map(layer => {
                                    const gid = mapData[layer][i];
                                    const ts = getTileInfo(gid);
                                    if (!ts) return null;
                                    const localI = gid - ts.firstgid;
                                    return (<div key={layer} className="tile-layer" style={{ backgroundImage: `url(${ts.src})`, backgroundPosition: `-${(localI % ts.columns) * 32}px -${Math.floor(localI / ts.columns) * 32}px`, zIndex: layer === 'background' ? 1 : layer === 'middleground' ? 2 : 3 }} />);
                                })}
                            </div>
                        ))}
                    </div>
                </div></div>
            </main>

            <style>{`
                .map-maker-root { display: flex; height: 100vh; background: #fbfaf8; overflow: hidden; pointer-events: auto !important; }
                .mm-sidebar { width: 400px; background: #fff; border-right: 1px solid #e0e0e0; padding: 40px; display: flex; flex-direction: column; overflow-y: auto; }
                .mm-logo-area { margin-bottom: 50px; }
                .mm-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #888; text-transform: uppercase; margin-bottom: 20px; }
                
                .mm-stage-select { width: 100%; padding: 12px; border: 1px solid #eee; background: #f9f9f9; font-weight: 700; margin-bottom: 10px; }
                .mm-layer-grid { display: flex; gap: 10px; margin-bottom: 40px; }
                .mm-layer-chip { flex: 1; padding: 10px; border: 1px solid #eee; background: none; font-size: 11px; font-weight: 700; cursor: pointer; text-transform: uppercase; transition: all 0.2s; }
                .mm-layer-chip.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }

                .mm-tileset-tabs { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 20px; }
                .mm-ts-tab { padding: 6px 12px; border: 1px solid #eee; background: none; font-size: 11px; font-weight: 700; cursor: pointer; }
                .mm-ts-tab.active { background: #4a90e2; color: #fff; border-color: #4a90e2; }

                .mm-visual-palette-container { height: 350px; background: #f5f5f5; border: 1px solid #ddd; overflow: auto; position: relative; margin-bottom: 30px; }
                .mm-visual-palette { position: relative; cursor: crosshair; }
                .mm-visual-palette img { display: block; image-rendering: pixelated; }
                
                .mm-palette-selection-rect { position: absolute; border: 2px solid #ff4757; background: rgba(255, 71, 87, 0.2); pointer-events: none; z-index: 20; }
                .mm-palette-selection { position: absolute; border: 2px solid #ff4757; box-shadow: 0 0 15px rgba(255, 71, 87, 0.5); pointer-events: none; z-index: 10; }

                .mm-selected-preview { background: #fbfaf8; border: 1px solid #eee; padding: 20px; margin-bottom: 20px; border-radius: 12px; }
                .mm-preview-container { display: flex; align-items: flex-start; gap: 15px; }
                .mm-preview-grid { display: grid; gap: 1px; max-width: 64px; max-height: 64px; overflow: hidden; }
                .mm-preview-tile-small { width: 16px; height: 16px; border: 0.5px solid #eee; image-rendering: pixelated; background-repeat: no-repeat; }
                .mm-preview-info { display: flex; flex-direction: column; }
                .mm-tile-gid { font-size: 10px; font-weight: 700; color: #888; }
                .mm-tile-name { font-size: 13px; font-weight: 700; color: #1a1a1a; }

                .mm-tool-box { margin-top: auto; display: grid; gap: 10px; }
                .mm-save-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .mm-tool-btn { padding: 15px; border: 1px solid #1a1a1a; background: none; font-weight: 700; cursor: pointer; }
                .mm-tool-btn.active { background: #ff4757; color: #fff; border-color: #ff4757; }
                .mm-export-btn { padding: 18px; background: #1a1a1a; color: #fff; border: none; font-weight: 700; cursor: pointer; letter-spacing: 1px; }
                .mm-export-btn.secondary { background: #fff; color: #1a1a1a; border: 1px solid #1a1a1a; }
                .mm-status { font-size: 12px; color: #4a90e2; font-weight: 700; margin-top: 5px; text-align: center; }

                .mm-canvas-area { flex: 1; padding: 60px; display: flex; flex-direction: column; overflow: auto; }
                .serif-title { font-family: 'Noto Serif KR', serif; font-size: 3rem; margin: 0 0 10px 0; }
                .editor-view { display: flex; justify-content: center; margin-top: 40px; }
                .canvas-frame { background: white; padding: 50px; box-shadow: 0 40px 100px rgba(0,0,0,0.05); border: 1px solid #eee; }
                .map-grid { display: grid; background: #f0f0f0; border: 1px solid #ddd; }
                .map-cell { width: 32px; height: 32px; position: relative; user-select: none; }
                .map-cell.grid { box-shadow: inset 0 0 1px rgba(0,0,0,0.2); }
                .map-cell:hover { background: rgba(0,0,0,0.05); outline: 1px solid #4a90e2; z-index: 100 !important; }
                .tile-layer { position: absolute; top:0; left:0; width:32px; height:32px; background-repeat: no-repeat; image-rendering: pixelated; }
                .clickable { cursor: pointer; }
            `}</style>
        </div>
    );
};

export default MapMaker;
