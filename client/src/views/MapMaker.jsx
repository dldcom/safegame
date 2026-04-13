import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TILE_SIZE = 32;
const MAP_WIDTH = 64;  // 32 -> 64 (2048px)
const MAP_HEIGHT = 64; // 32 -> 64 (2048px)

const OBJECT_TYPES = [
    { value: 'playerspawn', label: '👤 시작 지점 (Player)', color: '#4a90e2', prefix: '' },
    { value: 'npc', label: '👤 NPC 캐릭터', color: '#ff9f43', prefix: 'npc_' },
    { value: 'item', label: '📦 아이템/물건', color: '#2e86de', prefix: 'item_' }
];

const MapMaker = () => {
    const navigate = useNavigate();
    const [mapImage, setMapImage] = useState(null);
    const [editMode, setEditMode] = useState('wall');
    const [showGrid, setShowGrid] = useState(true);
    const [isDrawing, setIsDrawing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [history, setHistory] = useState([]);
    const [selectedStage, setSelectedStage] = useState('custom_ai_map');
    const [mapId, setMapId] = useState('stage_3');
    const [mapTitle, setMapTitle] = useState('AI 생성 커스텀 맵 (Stage 3)');
    const [drawTool, setDrawTool] = useState('brush'); // 'brush', 'area'
    const [dragStart, setDragStart] = useState(null);
    const [dragEnd, setDragEnd] = useState(null);
    const [selectedObjectType, setSelectedObjectType] = useState('playerspawn');
    const [objectSuffix, setObjectSuffix] = useState('');
    const [mapList, setMapList] = useState([]);
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [wallThreshold, setWallThreshold] = useState(40);
    const [wallColor, setWallColor] = useState({ r: 0, g: 0, b: 0 });
    const [detectMode, setDetectMode] = useState('dark'); // 'dark' or 'color'
    const [mapData, setMapData] = useState({
        collision: Array(MAP_WIDTH * MAP_HEIGHT).fill(0),
        spawns: [{ id: Date.now(), name: 'playerspawn', x: 200, y: 200 }]
    });

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
        setMapData(prev => {
            if (editMode === 'object') {
                const x = (index % MAP_WIDTH) * TILE_SIZE;
                const y = Math.floor(index / MAP_WIDTH) * TILE_SIZE;

                const selectedDef = OBJECT_TYPES.find(t => t.value === selectedObjectType);
                const fullName = selectedObjectType === 'playerspawn'
                    ? 'playerspawn'
                    : (selectedDef.prefix + (objectSuffix || 'unnamed'));

                // 이미 같은 위치에 오브젝트가 있다면 제거
                const alreadyExists = prev.spawns.find(s => s.x === x && s.y === y);
                if (alreadyExists) {
                    return {
                        ...prev,
                        spawns: prev.spawns.filter(s => s.id !== alreadyExists.id)
                    };
                }

                // 플레이어 스폰은 하나만 존재하도록 처리
                let filteredSpawns = prev.spawns;
                if (selectedObjectType === 'playerspawn') {
                    filteredSpawns = prev.spawns.filter(s => s.name === 'playerspawn' ? false : true);
                }

                return {
                    ...prev,
                    spawns: [...filteredSpawns, {
                        id: Date.now(),
                        name: fullName,
                        x, y,
                        width: TILE_SIZE,
                        height: TILE_SIZE
                    }]
                };
            }

            if (prev.collision[index] === (editMode === 'wall' ? 1 : 0)) return prev;

            const newCollision = [...prev.collision];
            newCollision[index] = editMode === 'wall' ? 1 : 0;

            return {
                ...prev,
                collision: newCollision
            };
        });
    };

    const handleAreaAction = (startIndex, endIndex) => {
        const startX = startIndex % MAP_WIDTH;
        const startY = Math.floor(startIndex / MAP_WIDTH);
        const endX = endIndex % MAP_WIDTH;
        const endY = Math.floor(endIndex / MAP_WIDTH);

        const xMin = Math.min(startX, endX);
        const xMax = Math.max(startX, endX);
        const yMin = Math.min(startY, endY);
        const yMax = Math.max(startY, endY);

        setMapData(prev => {
            const newCollision = [...prev.collision];
            const val = editMode === 'wall' ? 1 : 0;
            let changed = false;

            for (let y = yMin; y <= yMax; y++) {
                for (let x = xMin; x <= xMax; x++) {
                    const idx = y * MAP_WIDTH + x;
                    if (newCollision[idx] !== val) {
                        newCollision[idx] = val;
                        changed = true;
                    }
                }
            }
            return changed ? { ...prev, collision: newCollision } : prev;
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setMapImage(event.target?.result);
            reader.readAsDataURL(file);
        }
    };

    const handleMouseDown = (index) => {
        pushToHistory();
        setIsDrawing(true);
        // [수정] 오브젝트 배치 모드일 때는 드로우 툴과 상관없이 즉시 배치
        if (drawTool === 'brush' || editMode === 'object') {
            handleCellAction(index);
        } else {
            setDragStart(index);
            setDragEnd(index);
        }
    };

    const handleMouseEnter = (index) => {
        if (!isDrawing) return;
        // [수정] 오브젝트 배치 모드에서는 드래그로 그리는 것을 방지 (단일 클릭 권장)
        if (editMode === 'object') return;

        if (drawTool === 'brush') {
            handleCellAction(index);
        } else {
            setDragEnd(index);
        }
    };

    const handleMouseUpGlobal = () => {
        if (isDrawing && drawTool === 'area' && dragStart !== null && dragEnd !== null) {
            handleAreaAction(dragStart, dragEnd);
        }
        setIsDrawing(false);
        setDragStart(null);
        setDragEnd(null);
    };

    const generateTiledJson = () => ({
        compressionlevel: -1,
        height: MAP_HEIGHT,
        infinite: false,
        layers: [
            {
                data: mapData.collision || Array(MAP_WIDTH * MAP_HEIGHT).fill(0),
                height: MAP_HEIGHT,
                id: 1,
                name: "collision",
                opacity: 0.5,
                type: "tilelayer",
                visible: true,
                width: MAP_WIDTH,
                x: 0, y: 0
            },
            {
                draworder: "topdown",
                id: 2,
                name: "spawn",
                objects: (mapData.spawns || []).map(s => ({
                    id: s.id,
                    name: s.name,
                    point: false,
                    rotation: 0,
                    type: "",
                    visible: true,
                    x: s.x,
                    y: s.y,
                    width: s.width || 32,
                    height: s.height || 32
                })),
                opacity: 1,
                type: "objectgroup",
                visible: true,
                x: 0,
                y: 0
            }
        ],
        nextlayerid: 3,
        nextobjectid: 1,
        orientation: "orthogonal",
        renderorder: "right-down",
        tiledversion: "1.10.1",
        tileheight: 32,
        tilewidth: 32,
        type: "map",
        version: "1.10",
        properties: [
            { name: "bgImage", type: "string", value: mapImage || "" }
        ],
        tilesets: [
            {
                firstgid: 1,
                name: "CollisionTile",
                tilewidth: 32,
                tileheight: 32,
                tilecount: 1,
                columns: 1,
                margin: 0,
                spacing: 0,
                image: "Wall", // 이미 로드된 'Wall' 자산을 활용
                imagewidth: 32,
                imageheight: 32
            }
        ],
        width: MAP_WIDTH
    });

    const exportToJson = () => {
        const tiledJson = generateTiledJson();
        const blob = new Blob([JSON.stringify(tiledJson, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_map_export.json`;
        a.click();
    };

    const fetchMapList = async () => {
        try {
            const response = await fetch('/api/map/list');
            if (response.ok) {
                const data = await response.json();
                setMapList(data);
                setShowLoadModal(true);
            }
        } catch (error) {
            console.error('Fetch map list error:', error);
            setStatusMessage('목록을 불러오지 못했습니다.');
        }
    };

    const loadSelectedMap = async (id) => {
        if (!window.confirm('현재 작업 중인 내용이 사라집니다. 불러오시겠습니까?')) return;

        setStatusMessage('로딩 중...');
        try {
            const response = await fetch(`/api/map/${id}`);
            if (response.ok) {
                const map = await response.json();
                const content = map.content;

                // 역변환 로직
                setMapId(map.mapId);
                setMapTitle(map.title);

                // 배경 이미지 복구
                const bgProp = content.properties?.find(p => p.name === 'bgImage');
                if (bgProp) setMapImage(bgProp.value);

                // 레이어 복구
                const collisionLayer = content.layers.find(l => l.name === 'collision');
                const spawnLayer = content.layers.find(l => l.name === 'spawn');

                setMapData({
                    collision: collisionLayer ? collisionLayer.data : Array(MAP_WIDTH * MAP_HEIGHT).fill(0),
                    spawns: spawnLayer ? spawnLayer.objects.map(o => ({
                        id: o.id || Date.now() + Math.random(),
                        name: o.name,
                        x: o.x,
                        y: o.y,
                        width: o.width || 32,
                        height: o.height || 32
                    })) : []
                });

                setShowLoadModal(false);
                setStatusMessage('성공적으로 불러왔습니다!');
                setTimeout(() => setStatusMessage(''), 2000);
            }
        } catch (error) {
            console.error('Load map error:', error);
            setStatusMessage('맵을 불러오는 중 오류가 발생했습니다.');
        }
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
                    mapId: mapId,
                    title: mapTitle,
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

    // [추가] 맵 크기 변경 대응 로직
    useEffect(() => {
        const expectedSize = MAP_WIDTH * MAP_HEIGHT;
        if (mapData.collision.length !== expectedSize) {
            console.log(`>>> [MapMaker] Resizing collision array: ${mapData.collision.length} -> ${expectedSize}`);
            setMapData(prev => ({
                ...prev,
                collision: Array(expectedSize).fill(0)
            }));
        }
    }, [MAP_WIDTH, MAP_HEIGHT]);

    const autoDetectWalls = () => {
        if (!mapImage) {
            alert('먼저 맵 이미지를 업로드하세요.');
            return;
        }
        pushToHistory();
        setStatusMessage('벽 자동 감지 중...');

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = MAP_WIDTH;
            canvas.height = MAP_HEIGHT;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, MAP_WIDTH, MAP_HEIGHT);
            const imageData = ctx.getImageData(0, 0, MAP_WIDTH, MAP_HEIGHT);
            const prevCollision = mapData.collision;
            const newCollision = [...prevCollision];

            for (let i = 0; i < MAP_WIDTH * MAP_HEIGHT; i++) {
                const pi = i * 4;
                const r = imageData.data[pi];
                const g = imageData.data[pi + 1];
                const b = imageData.data[pi + 2];
                const a = imageData.data[pi + 3];

                let isWall = false;
                if (detectMode === 'dark') {
                    const brightness = (r + g + b) / 3;
                    isWall = brightness < (wallThreshold * 2.55);
                } else {
                    const dist = Math.sqrt(
                        Math.pow(r - wallColor.r, 2) +
                        Math.pow(g - wallColor.g, 2) +
                        Math.pow(b - wallColor.b, 2)
                    );
                    isWall = dist < (wallThreshold * 1.5);
                }

                if (a < 50) isWall = false;
                if (isWall) newCollision[i] = 1;
            }

            setMapData(prev => ({ ...prev, collision: newCollision }));
            setStatusMessage('벽 자동 감지 완료!');
            setTimeout(() => setStatusMessage(''), 2000);
        };
        img.src = mapImage;
    };

    const pickWallColor = async () => {
        if (!('EyeDropper' in window)) {
            alert('최신 브라우저를 사용해주세요.');
            return;
        }
        const dropper = new window.EyeDropper();
        try {
            const result = await dropper.open();
            const hex = result.sRGBHex;
            setWallColor({
                r: parseInt(hex.slice(1, 3), 16),
                g: parseInt(hex.slice(3, 5), 16),
                b: parseInt(hex.slice(5, 7), 16)
            });
            setDetectMode('color');
        } catch (e) {
            console.log('Pick cancelled');
        }
    };

    const handleClearMap = () => {
        if (window.confirm('맵의 모든 벽을 지우시겠습니까?')) {
            pushToHistory();
            setMapData(prev => ({
                ...prev,
                collision: Array(MAP_WIDTH * MAP_HEIGHT).fill(0)
            }));
        }
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUpGlobal);
        return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
    }, [isDrawing, drawTool, dragStart, dragEnd, editMode]); // Dependencies for up global

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [history]); // history changes on undo/push

    return (
        <div className="map-maker-root">
            <aside className="mm-sidebar">
                <div className="mm-logo-area">
                    <h2 onClick={() => navigate('/teacher')} className="ed-logo clickable">Sage.</h2>
                    <span className="ed-logo-sub">Map Logic Console</span>
                </div>

                <div className="mm-db-actions" style={{ marginBottom: '20px' }}>
                    <button className="mm-export-btn secondary" style={{ width: '100%' }} onClick={fetchMapList}>
                        📁 저장된 맵 목록 보기
                    </button>
                </div>

                <div className="mm-layer-section">
                    <label className="mm-label">맵 이미지 파일 (.png / .jpg)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mm-file-input"
                        id="map-upload"
                    />
                    <label htmlFor="map-upload" className="mm-upload-btn">
                        🖼️ 맵 이미지 불러오기
                    </label>

                    <div className="mm-auto-detect" style={{ marginTop: '25px', padding: '15px', background: '#f0faf5', border: '2px solid #00BFA5', borderRadius: '8px' }}>
                        <label className="mm-label" style={{ color: '#00BFA5', marginBottom: '10px' }}>벽 자동 감지</label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                            <button
                                className="mm-tool-btn"
                                style={{ flex: 1, fontSize: '11px', background: detectMode === 'dark' ? '#1a1a1a' : '#fff', color: detectMode === 'dark' ? '#fff' : '#1a1a1a' }}
                                onClick={() => setDetectMode('dark')}
                            >
                                어두운색 = 벽
                            </button>
                            <button
                                className="mm-tool-btn"
                                style={{ flex: 1, fontSize: '11px', background: detectMode === 'color' ? '#1a1a1a' : '#fff', color: detectMode === 'color' ? '#fff' : '#1a1a1a' }}
                                onClick={() => setDetectMode('color')}
                            >
                                지정색 = 벽
                            </button>
                        </div>
                        {detectMode === 'color' && (
                            <button
                                className="mm-tool-btn"
                                onClick={pickWallColor}
                                style={{ width: '100%', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1px solid #ccc', background: `rgb(${wallColor.r},${wallColor.g},${wallColor.b})` }}></div>
                                벽 색상 추출
                            </button>
                        )}
                        <div style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, color: '#888', marginBottom: '4px' }}>
                                <span>감지 감도</span><span>{wallThreshold}</span>
                            </div>
                            <input type="range" min="5" max="100" value={wallThreshold} onChange={(e) => setWallThreshold(parseInt(e.target.value))} style={{ width: '100%' }} />
                        </div>
                        <button
                            className="mm-tool-btn"
                            onClick={autoDetectWalls}
                            style={{ width: '100%', background: '#00BFA5', color: '#fff', border: 'none', fontWeight: 800, fontSize: '13px' }}
                        >
                            🔍 벽 자동 감지 실행
                        </button>
                    </div>

                    <label className="mm-label" style={{ marginTop: '30px' }}>편집 모드</label>
                    <div className="mm-tool-grid" style={{ marginBottom: '10px' }}>
                        <button
                            className={`mm-tool-btn ${drawTool === 'brush' ? 'active-tool' : ''}`}
                            onClick={() => setDrawTool('brush')}
                        >
                            🖌️ 브러시 (Brush)
                        </button>
                        <button
                            className={`mm-tool-btn ${drawTool === 'area' ? 'active-tool' : ''}`}
                            onClick={() => setDrawTool('area')}
                        >
                            ⬛ 영역 채우기 (Area)
                        </button>
                    </div>

                    <label className="mm-label">충돌 타일 종류</label>
                    <div className="mm-tool-grid">
                        <button
                            className={`mm-tool-btn ${editMode === 'wall' ? 'active-wall' : ''}`}
                            onClick={() => setEditMode('wall')}
                        >
                            🧱 벽 (Wall)
                        </button>
                        <button
                            className={`mm-tool-btn ${editMode === 'eraser' ? 'active-eraser' : ''}`}
                            onClick={() => setEditMode('eraser')}
                        >
                            🧹 지우개 (Eraser)
                        </button>
                    </div>

                    <label className="mm-label" style={{ marginTop: '20px' }}>오브젝트 배치</label>
                    <div className="mm-object-selector">
                        <select
                            className="mm-select"
                            value={selectedObjectType}
                            onChange={(e) => {
                                setSelectedObjectType(e.target.value);
                                setEditMode('object');
                                setDrawTool('brush'); // 오브젝트 모드 시 브러시 강제
                            }}
                        >
                            {OBJECT_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                        {selectedObjectType !== 'playerspawn' && (
                            <div style={{ marginTop: '10px' }}>
                                <label className="mm-label" style={{ fontSize: '10px', marginBottom: '5px' }}>
                                    {selectedObjectType === 'npc' ? 'NPC ID (npc_...)' : '아이템 ID (item_...)'}
                                </label>
                                <input
                                    type="text"
                                    className="mm-text-input"
                                    value={objectSuffix}
                                    onChange={(e) => setObjectSuffix(e.target.value.replace(/[^a-z0-9_]/gi, ''))}
                                    placeholder="예: doctor, water_bottle"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                        )}
                        <button
                            className={`mm-tool-btn ${editMode === 'object' ? 'active-object' : ''}`}
                            onClick={() => {
                                setEditMode('object');
                                setDrawTool('brush'); // 오브젝트 모드 시 브러시 강제
                            }}
                            style={{ marginTop: '10px', width: '100%' }}
                        >
                            📍 오브젝트 배치 모드
                        </button>
                    </div>

                    <label className="mm-label" style={{ marginTop: '20px' }}>배치된 오브젝트 ({mapData.spawns.length})</label>
                    <div className="mm-object-list">
                        {mapData.spawns.map(s => (
                            <div key={s.id} className="mm-obj-item">
                                <div style={{ flex: 1 }}>
                                    {s.name === 'playerspawn' ? (
                                        <span style={{ fontWeight: 800, color: '#4a90e2' }}>START_POINT</span>
                                    ) : (
                                        <input
                                            type="text"
                                            value={s.name}
                                            onChange={(e) => {
                                                const newName = e.target.value;
                                                setMapData(prev => ({
                                                    ...prev,
                                                    spawns: prev.spawns.map(p => p.id === s.id ? { ...p, name: newName } : p)
                                                }));
                                            }}
                                            style={{
                                                width: '100%', border: 'none', background: 'transparent',
                                                fontSize: '11px', fontWeight: 600, color: '#1a1a1a',
                                                padding: '2px 0'
                                            }}
                                        />
                                    )}
                                    <div style={{ fontSize: '8px', opacity: 0.5 }}>POS: {s.x / 32}, {s.y / 32}</div>
                                </div>
                                <button onClick={() => setMapData(prev => ({ ...prev, spawns: prev.spawns.filter(p => p.id !== s.id) }))}>❌</button>
                            </div>
                        ))}
                    </div>

                    <button
                        className="mm-tool-btn"
                        onClick={handleClearMap}
                        style={{ marginTop: '10px', width: '100%', background: '#ff475711', color: '#ff4757', border: '1px solid #ff475722' }}
                    >
                        🗑️ 맵 초기화 (Clear)
                    </button>
                </div>

                <div className="mm-tool-box" style={{ marginTop: '30px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label className="mm-label">시스템 식별 ID (mapId)</label>
                        <p style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>* stage_3 처럼 영문 아이디를 쓰세요.</p>
                        <input
                            type="text"
                            className="mm-text-input"
                            value={mapId}
                            onChange={(e) => setMapId(e.target.value)}
                            placeholder="예: stage_3"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '2px solid #000',
                                fontFamily: 'monospace'
                            }}
                        />
                    </div>

                    <div>
                        <label className="mm-label">맵 제목 (title)</label>
                        <p style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>* 관리용 이름을 써주세요.</p>
                        <input
                            type="text"
                            className="mm-text-input"
                            value={mapTitle}
                            onChange={(e) => setMapTitle(e.target.value)}
                            placeholder="예: 화재 대피 교육실"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '2px solid #000'
                            }}
                        />
                    </div>
                </div>

                <div className="mm-tool-box">
                    <div className="mm-save-actions" style={{ marginTop: '20px' }}>
                        <button className="mm-export-btn secondary" onClick={exportToJson}>JSON 다운로드</button>
                        <button className="mm-export-btn" onClick={saveToServer}>DB에 즉시 저장</button>
                    </div>
                    {statusMessage && <p className="mm-status">{statusMessage}</p>}
                </div>
            </aside>

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
                <div className="editor-view">
                    <div className="canvas-frame">
                        <div className="canvas-container" style={{ position: 'relative' }}>
                            {/* AI 생성 바닥 이미지 */}
                            {mapImage && (
                                <img
                                    src={mapImage}
                                    alt="Map Background"
                                    className="map-base-layer"
                                    style={{ width: MAP_WIDTH * TILE_SIZE, height: MAP_HEIGHT * TILE_SIZE, display: 'block' }}
                                />
                            )}

                            {/* 충돌 그리드 레이어 */}
                            <div
                                className="map-grid"
                                onDragStart={(e) => e.preventDefault()}
                                style={{
                                    gridTemplateColumns: `repeat(${MAP_WIDTH}, 32px)`,
                                    position: 'absolute',
                                    inset: 0,
                                    background: mapImage ? 'transparent' : '#eee',
                                    userSelect: 'none'
                                }}
                            >
                                {mapData.collision.map((isWall, i) => {
                                    // 영역 드래그 중인 하이라이트 계산
                                    let isHighlighted = false;
                                    if (isDrawing && drawTool === 'area' && dragStart !== null && dragEnd !== null) {
                                        const sX = dragStart % MAP_WIDTH;
                                        const sY = Math.floor(dragStart / MAP_WIDTH);
                                        const eX = dragEnd % MAP_WIDTH;
                                        const eY = Math.floor(dragEnd / MAP_WIDTH);
                                        const currX = i % MAP_WIDTH;
                                        const currY = Math.floor(i / MAP_WIDTH);
                                        isHighlighted =
                                            currX >= Math.min(sX, eX) && currX <= Math.max(sX, eX) &&
                                            currY >= Math.min(sY, eY) && currY <= Math.max(sY, eY);
                                    }

                                    return (
                                        <div
                                            key={i}
                                            className={`map-cell ${showGrid ? 'grid' : ''} ${isWall ? 'is-wall' : ''} ${isHighlighted ? 'is-highlight' : ''}`}
                                            onMouseDown={() => handleMouseDown(i)}
                                            onMouseEnter={() => handleMouseEnter(i)}
                                        >
                                            {isWall === 1 && <div className="wall-overlay" />}
                                            {isHighlighted && <div className="area-highlight-overlay" />}
                                        </div>
                                    );
                                })}

                                {/* 오브젝트 레이어 표시 */}
                                {mapData.spawns.map(spawn => (
                                    <div
                                        key={spawn.id}
                                        className={`spawn-marker-overlay ${spawn.name}`}
                                        style={{
                                            position: 'absolute',
                                            left: spawn.x,
                                            top: spawn.y,
                                            width: TILE_SIZE,
                                            height: TILE_SIZE,
                                            zIndex: 200,
                                            pointerEvents: 'none'
                                        }}
                                    >
                                        <div className="marker-core" />
                                        <span className="marker-label">{spawn.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 불러오기 모달 */}
            <LoadMapModal
                isOpen={showLoadModal}
                onClose={() => setShowLoadModal(false)}
                maps={mapList}
                onSelect={loadSelectedMap}
            />

            <style>{`
                .map-maker-root { display: flex; height: 100vh; background: #fbfaf8; overflow: hidden; pointer-events: auto !important; }
                .mm-sidebar { width: 400px; background: #fff; border-right: 1px solid #e0e0e0; padding: 40px; display: flex; flex-direction: column; overflow-y: auto; }
                .mm-logo-area { margin-bottom: 50px; }
                .mm-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #888; text-transform: uppercase; margin-bottom: 20px; }
                
                .mm-file-input { display: none; }
                .mm-upload-btn {
                    display: flex; align-items: center; justify-content: center;
                    width: 100%; padding: 15px; background: #fff; border: 2px dashed #ddd;
                    font-weight: 700; cursor: pointer; transition: 0.2s; border-radius: 8px;
                }
                .mm-upload-btn:hover { border-color: #1a1a1a; background: #f9f9f9; }

                .mm-tool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
                .mm-tool-btn { 
                    padding: 15px; border: 1px solid #eee; background: #fff; 
                    font-weight: 700; cursor: pointer; border-radius: 8px; font-size: 12px;
                    transition: 0.2s;
                }
                .mm-tool-btn.active-tool { background: #4a90e2; color: #fff; border-color: #4a90e2; }
                .mm-tool-btn.active-wall { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
                .mm-tool-btn.active-eraser { background: #ff4757; color: #fff; border-color: #ff4757; }
                .mm-tool-btn.active-object { background: #00BFA5; color: #fff; border-color: #00BFA5; }

                .mm-select {
                    width: 100%; padding: 12px; border: 2px solid #000; border-radius: 8px;
                    font-weight: 700; font-family: inherit; cursor: pointer; background: #fff;
                }

                .mm-object-list {
                    max-height: 200px; overflow-y: auto; background: #f9f9f9; border-radius: 8px;
                    padding: 10px; border: 1px solid #eee; margin-bottom: 20px;
                }
                .mm-obj-item {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 8px; border-bottom: 1px solid #eee; font-size: 11px; font-weight: 600;
                }
                .mm-obj-item button { 
                    background: none; border: none; cursor: pointer; padding: 2px 5px; 
                    border-radius: 4px; transition: 0.2s;
                }
                .mm-obj-item button:hover { background: #ff475722; }

                /* Spawn Markers */
                .spawn-marker-overlay {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                }
                .marker-core {
                    width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff;
                    box-shadow: 0 0 10px rgba(0,0,0,0.3);
                }
                .marker-label {
                    font-size: 8px; font-weight: 800; color: #fff; background: rgba(0,0,0,0.6);
                    padding: 1px 4px; border-radius: 3px; margin-top: 2px; white-space: nowrap;
                }
                .playerspawn .marker-core { background: #4a90e2; }
                .spawn-marker-overlay[class*="npc_"] .marker-core { background: #ff9f43; }
                .spawn-marker-overlay[class*="item_"] .marker-core { background: #2e86de; }
                
                /* 하위 호환성용 */
                .npcspawn .marker-core { background: #ff9f43; }
                .npc_hurt .marker-core { background: #ee5253; }
                .sinkspawn .marker-core { background: #2e86de; }
                .door_exit .marker-core { background: #10ac84; }
                .item_extinguisher .marker-core { background: #ff4757; }
                .item_medkit .marker-core { background: #ff9ff3; }
                .item_water .marker-core { background: #54a0ff; }
                .hazard_fire .marker-core { background: #ff9f43; }
                .item_outlet .marker-core { background: #576574; }

                .mm-canvas-area { flex: 1; padding: 60px; display: flex; flex-direction: column; overflow: auto; }
                .serif-title { font-family: 'Noto Serif KR', serif; font-size: 3rem; margin: 0 0 10px 0; }
                .canvas-frame { background: white; padding: 50px; box-shadow: 0 40px 100px rgba(0,0,0,0.05); border: 1px solid #eee; }
                
                .map-grid { display: grid; border: 1px solid rgba(0,0,0,0.1); }
                .map-cell { width: 32px; height: 32px; position: relative; user-select: none; }
                .map-cell.grid { outline: 0.5px solid rgba(0,0,0,0.05); }
                .map-cell:hover { background: rgba(0,0,0,0.1); z-index: 100 !important; }
                
                .wall-overlay {
                    position: absolute; inset: 0;
                    background: rgba(100, 100, 100, 0.6);
                    backdrop-filter: grayscale(1);
                    border: 0.5px solid rgba(255,255,255,0.2);
                }

                .area-highlight-overlay {
                    position: absolute; inset: 0;
                    background: rgba(74, 144, 226, 0.4);
                    border: 1px solid #4a90e2;
                    z-index: 10;
                }

                .mm-tool-box { margin-top: auto; display: grid; gap: 10px; }
                .mm-save-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .mm-export-btn { padding: 18px; background: #1a1a1a; color: #fff; border: none; font-weight: 700; cursor: pointer; letter-spacing: 1px; border-radius: 8px; }
                .mm-export-btn.secondary { background: #fff; color: #1a1a1a; border: 1px solid #1a1a1a; }
                .mm-status { font-size: 12px; color: #4a90e2; font-weight: 700; margin-top: 5px; text-align: center; }
                .clickable { cursor: pointer; }
            `}</style>
        </div >
    );
};

// 불러오기 모달 컴포넌트
const LoadMapModal = ({ isOpen, onClose, maps, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="mm-modal-overlay">
            <div className="mm-modal-content">
                <header className="mm-modal-header">
                    <h3>DB 저장된 맵 불러오기</h3>
                    <button onClick={onClose}>&times;</button>
                </header>
                <div className="mm-map-grid-list">
                    {maps.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px' }}>저장된 맵이 없습니다.</p>
                    ) : (
                        maps.map(map => (
                            <div key={map.mapId} className="mm-map-card" onClick={() => onSelect(map.mapId)}>
                                <div className="card-info">
                                    <h4>{map.title}</h4>
                                    <p>ID: {map.mapId}</p>
                                    <p>제작: {map.author}</p>
                                    <small>{new Date(map.createdAt).toLocaleDateString()}</small>
                                </div>
                                <div className="card-btn">불러오기</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <style>{`
                .mm-modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.8);
                    display: flex; align-items: center; justify-content: center; z-index: 1000;
                    backdrop-filter: blur(5px);
                }
                .mm-modal-content {
                    background: #fff; width: 600px; max-height: 80vh; border-radius: 20px;
                    display: flex; flex-direction: column; overflow: hidden;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
                }
                .mm-modal-header {
                    padding: 20px 30px; border-bottom: 1px solid #eee;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .mm-modal-header h3 { margin: 0; font-family: 'Noto Serif KR', serif; }
                .mm-modal-header button { background: none; border: none; font-size: 24px; cursor: pointer; }
                
                .mm-map-grid-list { padding: 30px; overflow-y: auto; display: grid; gap: 15px; }
                .mm-map-card {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 20px; border: 1px solid #eee; border-radius: 12px;
                    cursor: pointer; transition: 0.2s;
                }
                .mm-map-card:hover { border-color: #1a1a1a; background: #f9f9f9; transform: translateY(-2px); }
                .mm-map-card h4 { margin: 0 0 5px 0; font-size: 16px; }
                .mm-map-card p { margin: 0; font-size: 12px; color: #666; }
                .mm-map-card small { font-size: 10px; color: #999; }
                
                .card-btn {
                    padding: 8px 16px; background: #1a1a1a; color: #fff;
                    border-radius: 6px; font-size: 12px; font-weight: 700;
                }
            `}</style>
        </div>
    );
};

export default MapMaker;
