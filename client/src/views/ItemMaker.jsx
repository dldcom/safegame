import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Upload, Image as ImageIcon, Save, Trash2, Package, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ItemMaker.css';

const SPRITE_SIZE = 32;
const CANVAS_DISPLAY = 512;

const ItemMaker = () => {
    const navigate = useNavigate();

    // Image list (batch)
    const [images, setImages] = useState([]);
    const [selectedIdx, setSelectedIdx] = useState(-1);

    // Editor state — 흰색 배경 고정
    const bgColor = { r: 255, g: 255, b: 255 };
    const [threshold, setThreshold] = useState(30);
    const [processedData, setProcessedData] = useState(null);

    // Item info
    const [itemId, setItemId] = useState('');
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('tool');
    const [stageNum, setStageNum] = useState(3);

    // Saved items from DB
    const [savedItems, setSavedItems] = useState([]);

    const mainCanvasRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // Load saved items
    useEffect(() => {
        fetchSavedItems();
    }, []);

    const fetchSavedItems = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/item/list');
            if (res.ok) setSavedItems(await res.json());
        } catch (e) {
            console.error('Failed to fetch items:', e);
        }
    };

    // Handle multiple file upload
    const handleUpload = (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    setImages(prev => [...prev, {
                        src: ev.target.result,
                        img,
                        name: file.name.replace(/\.[^.]+$/, '')
                    }]);
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (idx) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
        if (selectedIdx === idx) {
            setSelectedIdx(-1);
            setProcessedData(null);
        } else if (selectedIdx > idx) {
            setSelectedIdx(prev => prev - 1);
        }
    };

    // Process image: remove background
    const processImage = useCallback((img, bgCol, thresh) => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        // Remove background by color distance
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const dist = Math.sqrt(
                (bgCol.r - r) ** 2 + (bgCol.g - g) ** 2 + (bgCol.b - b) ** 2
            );
            if (dist < thresh * 4.4) {
                data[i + 3] = 0; // make transparent
            }
        }

        // Noise removal: remove isolated pixels
        const w = img.width, h = img.height;
        const cleaned = new Uint8ClampedArray(data);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                if (data[i + 3] > 0) {
                    let neighbors = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const nx = x + dx, ny = y + dy;
                            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                                const ni = (ny * w + nx) * 4;
                                if (data[ni + 3] > 0) neighbors++;
                            }
                        }
                    }
                    if (neighbors <= 1) cleaned[i + 3] = 0;
                }
            }
        }

        // Find bounding box of remaining content
        let minX = w, maxX = 0, minY = h, maxY = 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                if (cleaned[i + 3] > 0) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        imageData.data.set(cleaned);
        ctx.putImageData(imageData, 0, 0);

        return {
            canvas,
            bounds: { minX, maxX, minY, maxY },
            hasContent: maxX >= minX
        };
    }, []);

    // Re-process when selection or params change
    useEffect(() => {
        if (selectedIdx < 0 || !images[selectedIdx]) {
            setProcessedData(null);
            return;
        }
        const { img } = images[selectedIdx];
        const result = processImage(img, bgColor, threshold);
        setProcessedData(result);
    }, [selectedIdx, images, bgColor, threshold, processImage]);

    // Draw main canvas
    useEffect(() => {
        const canvas = mainCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, CANVAS_DISPLAY, CANVAS_DISPLAY);

        if (!processedData || !processedData.hasContent) return;

        const { canvas: srcCanvas, bounds } = processedData;
        const bw = bounds.maxX - bounds.minX + 1;
        const bh = bounds.maxY - bounds.minY + 1;
        const scale = Math.min(CANVAS_DISPLAY * 0.85 / bw, CANVAS_DISPLAY * 0.85 / bh);
        const dw = bw * scale;
        const dh = bh * scale;
        const dx = (CANVAS_DISPLAY - dw) / 2;
        const dy = (CANVAS_DISPLAY - dh) / 2;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(srcCanvas, bounds.minX, bounds.minY, bw, bh, dx, dy, dw, dh);
    }, [processedData]);

    // Draw 32x32 preview
    useEffect(() => {
        const canvas = previewCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

        if (!processedData || !processedData.hasContent) return;

        const { canvas: srcCanvas, bounds } = processedData;
        const bw = bounds.maxX - bounds.minX + 1;
        const bh = bounds.maxY - bounds.minY + 1;
        const scale = Math.min(SPRITE_SIZE / bw, SPRITE_SIZE / bh);
        const dw = bw * scale;
        const dh = bh * scale;
        const dx = (SPRITE_SIZE - dw) / 2;
        const dy = (SPRITE_SIZE - dh) / 2;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(srcCanvas, bounds.minX, bounds.minY, bw, bh, dx, dy, dw, dh);
    }, [processedData]);


    // Save to server
    const saveItem = async () => {
        if (!processedData || !processedData.hasContent || !itemId || !itemName) {
            alert('이미지와 아이템 정보를 모두 입력해주세요.');
            return;
        }

        // Generate final 32x32 sprite
        const spriteCanvas = document.createElement('canvas');
        spriteCanvas.width = SPRITE_SIZE;
        spriteCanvas.height = SPRITE_SIZE;
        const ctx = spriteCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const { canvas: srcCanvas, bounds } = processedData;
        const bw = bounds.maxX - bounds.minX + 1;
        const bh = bounds.maxY - bounds.minY + 1;
        const scale = Math.min(SPRITE_SIZE / bw, SPRITE_SIZE / bh);
        const dw = bw * scale;
        const dh = bh * scale;
        const dx = (SPRITE_SIZE - dw) / 2;
        const dy = (SPRITE_SIZE - dh) / 2;
        ctx.drawImage(srcCanvas, bounds.minX, bounds.minY, bw, bh, dx, dy, dw, dh);

        const blob = await new Promise(resolve => spriteCanvas.toBlob(resolve, 'image/png'));
        const formData = new FormData();
        formData.append('itemImage', blob, `${itemId}.png`);
        formData.append('itemId', itemId);
        formData.append('name', itemName);
        formData.append('category', category);
        formData.append('stageNum', String(stageNum));

        try {
            const res = await fetch('http://localhost:3001/api/item/upload', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert(`"${itemName}" 저장 완료!`);
                setItemId('');
                setItemName('');
                fetchSavedItems();
            } else {
                const err = await res.json();
                alert('저장 실패: ' + err.message);
            }
        } catch (e) {
            alert('서버 연결 오류');
        }
    };

    const deleteItem = async (id) => {
        if (!confirm('정말 삭제할까요?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/item/${id}`, { method: 'DELETE' });
            if (res.ok) fetchSavedItems();
        } catch (e) {
            alert('삭제 실패');
        }
    };

    const selectedImage = selectedIdx >= 0 ? images[selectedIdx] : null;

    return (
        <div className="item-maker-container">
            <div className="im-wrapper">
                <header className="im-header">
                    <div>
                        <button onClick={() => navigate(-1)} className="im-back-btn">
                            <ArrowLeft size={16} /> 돌아가기
                        </button>
                        <h1 className="im-title">아이템 스프라이트 메이커</h1>
                    </div>
                </header>

                <main className="im-main">
                    {/* Left: Image List */}
                    <div className="im-panel">
                        <div className="im-panel-title"><Upload size={14} /> 이미지 목록</div>
                        <button
                            className="im-upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={16} />
                            이미지 추가
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleUpload}
                            style={{ display: 'none' }}
                        />
                        <div className="im-thumb-list">
                            {images.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`im-thumb-item ${selectedIdx === idx ? 'active' : ''}`}
                                    onClick={() => setSelectedIdx(idx)}
                                >
                                    <img src={item.src} className="im-thumb-img" alt="" />
                                    <span className="im-thumb-name">{item.name}</span>
                                    <button className="im-thumb-remove" onClick={(e) => { e.stopPropagation(); removeImage(idx); }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Center: Canvas Editor */}
                    <div className="im-editor">
                        {selectedImage ? (
                            <>
                                <div className="im-canvas-area">
                                    <canvas
                                        ref={mainCanvasRef}
                                        width={CANVAS_DISPLAY}
                                        height={CANVAS_DISPLAY}
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </div>

                                {/* Controls */}
                                <div className="im-controls-row">
                                    <div className="im-slider-group">
                                        <div className="im-slider-label"><span>배경 제거 감도</span><span>{threshold}</span></div>
                                        <input type="range" min="0" max="100" value={threshold} onChange={e => setThreshold(parseInt(e.target.value))} />
                                    </div>
                                </div>

                                {/* 32x32 Preview */}
                                <div className="im-preview-section">
                                    <div className="im-preview-box">
                                        <canvas
                                            ref={previewCanvasRef}
                                            width={SPRITE_SIZE}
                                            height={SPRITE_SIZE}
                                            style={{ width: '96px', height: '96px' }}
                                        />
                                    </div>
                                    <div className="im-preview-info">
                                        <Eye size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                        <strong>32x32 미리보기</strong><br />
                                        실제 게임에서 보이는 크기입니다.<br />
                                        배경이 깔끔하게 제거되었는지 확인하세요.
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="im-empty">
                                <Package size={48} />
                                <p style={{ fontSize: '0.85rem' }}>왼쪽에서 이미지를 선택하세요</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Item Info & Save */}
                    <div className="im-panel">
                        <div className="im-panel-title"><Save size={14} /> 아이템 정보</div>
                        <div className="im-info-group">
                            <div>
                                <div className="im-info-label">아이템 ID</div>
                                <input className="im-info-input" value={itemId} onChange={e => setItemId(e.target.value)} placeholder="compass" />
                            </div>
                            <div>
                                <div className="im-info-label">아이템 이름</div>
                                <input className="im-info-input" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="나침반" />
                            </div>
                            <div>
                                <div className="im-info-label">카테고리</div>
                                <select className="im-info-select" value={category} onChange={e => setCategory(e.target.value)}>
                                    <option value="tool">도구 (tool)</option>
                                    <option value="map_piece">지도 조각 (map_piece)</option>
                                    <option value="key_item">핵심 아이템 (key_item)</option>
                                    <option value="etc">기타 (etc)</option>
                                </select>
                            </div>
                            <div>
                                <div className="im-info-label">스테이지</div>
                                <input className="im-info-input" type="number" min="1" value={stageNum} onChange={e => setStageNum(parseInt(e.target.value) || 1)} />
                            </div>
                        </div>
                        <button
                            className="im-save-btn"
                            disabled={!processedData?.hasContent || !itemId || !itemName}
                            onClick={saveItem}
                        >
                            <Save size={16} /> 서버에 저장
                        </button>

                        {/* Saved Items */}
                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                            <div className="im-panel-title"><Package size={14} /> 저장된 아이템 ({savedItems.length})</div>
                            <div className="im-saved-list">
                                {savedItems.map(item => (
                                    <div key={item.id} className="im-saved-item">
                                        <img src={`http://localhost:3001${item.imagePath}`} alt={item.name} />
                                        <div className="im-saved-item-info">
                                            <div className="im-saved-item-name">{item.name}</div>
                                            <div className="im-saved-item-meta">{item.itemId} / Stage {item.stageNum}</div>
                                        </div>
                                        <button className="im-thumb-remove" onClick={() => deleteItem(item.id)}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                {savedItems.length === 0 && (
                                    <p style={{ fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>
                                        아직 저장된 아이템이 없습니다
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ItemMaker;
