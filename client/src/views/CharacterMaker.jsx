import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RefreshCw, Camera, Image as ImageIcon, Sparkles, FileJson, ArrowLeft, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CharacterMaker.css';
import './CropModal.css';

const CharacterMaker = () => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [pixelData, setPixelData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [frame, setFrame] = useState(0);
    const [direction, setDirection] = useState('down');
    const [showGrid, setShowGrid] = useState(false);
    const [bgThreshold, setBgThreshold] = useState(10);
    const [cropRange, setCropRange] = useState([20, 80]); // [Top%, Bottom%]
    const [autoAlign, setAutoAlign] = useState(true);
    const [removeNoise, setRemoveNoise] = useState(true);
    const [useErosion, setUseErosion] = useState(false);
    const [targetBgColor, setTargetBgColor] = useState({ r: 255, g: 255, b: 255 });
    const [headLimit, setHeadLimit] = useState(24);
    const [legLimit, setLegLimit] = useState(44);
    const [charName, setCharName] = useState('');

    const [showCropModal, setShowCropModal] = useState(false);
    const [tempSrc, setTempSrc] = useState(null);
    const [rawImage, setRawImage] = useState(null);
    const [dragPos, setDragPos] = useState({ top: 20, bottom: 80 }); // Percentage

    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const cropOverlayRef = useRef(null);

    const W = 48;
    const H = 64;

    const handleUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const src = event.target?.result;
                setTempSrc(src);
                setDragPos({ top: 20, bottom: 80 }); // 모달 열때 위치 초기화
                setShowCropModal(true);
                if (fileInputRef.current) fileInputRef.current.value = ""; // 파일 입력 초기화
            };
            reader.readAsDataURL(file);
        }
    };

    const confirmCrop = () => {
        setCropRange([dragPos.top, dragPos.bottom]);
        setImage(tempSrc);
        processImage(tempSrc);
        setShowCropModal(false);
    };

    const processImage = (src) => {
        const img = new Image();
        img.onload = () => {
            setRawImage(img);
            runFilters(img);
        };
        img.src = src;
    };

    const pickColor = async () => {
        if (!('EyeDropper' in window)) {
            alert('최신 브라우저를 사용해주세요.');
            return;
        }
        // @ts-ignore
        const dropper = new window.EyeDropper();
        try {
            const result = await dropper.open();
            const color = result.sRGBHex;
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            setTargetBgColor({ r, g, b });
        } catch (e) {
            console.log('Pick cancelled');
        }
    };

    const runFilters = (img) => {
        setIsProcessing(true);
        const data = {};

        // 원본 분석용 캔버스
        const analysisCanvas = document.createElement('canvas');
        analysisCanvas.width = img.width;
        analysisCanvas.height = img.height;
        const analysisCtx = analysisCanvas.getContext('2d');
        analysisCtx.drawImage(img, 0, 0);
        const fullImageData = analysisCtx.getImageData(0, 0, img.width, img.height);

        // 이미지 3등분 기준 계산
        // 수동 설정된 커팅 영역 계산
        const startY = Math.floor(img.height * (cropRange[0] / 100));
        const endY = Math.floor(img.height * (cropRange[1] / 100));
        const cropHeight = endY - startY;
        const sw = Math.floor(img.width / 3);

        ['front', 'side', 'back'].forEach((view, index) => {
            const sx = index * sw;

            // 1. 해당 영역에서 캐릭터 바운딩 박스 찾기 (배경 무시)
            let minX = sw, maxX = 0, minY = cropHeight, maxY = 0, hasContent = false;
            for (let y = startY; y < endY; y++) {
                for (let x = 0; x < sw; x++) {
                    const i = Math.floor((y * img.width + (sx + x)) * 4);
                    const r = fullImageData.data[i];
                    const g = fullImageData.data[i + 1];
                    const b = fullImageData.data[i + 2];
                    const a = fullImageData.data[i + 3];

                    const dist = Math.sqrt(Math.pow(targetBgColor.r - r, 2) + Math.pow(targetBgColor.g - g, 2) + Math.pow(targetBgColor.b - b, 2));

                    // 알파값이 있거나 배경색과 다를 경우 컨텐츠로 간주
                    if (a > 50 && dist > bgThreshold * 4.4) {
                        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
                        minY = Math.min(minY, y - startY); maxY = Math.max(maxY, y - startY);
                        hasContent = true;
                    }
                }
            }

            // 2. 캐릭터를 48x64 프레임에 맞게 크기 계산 및 그리기
            const targetCanvas = document.createElement('canvas');
            targetCanvas.width = W;
            targetCanvas.height = H;
            const targetCtx = targetCanvas.getContext('2d');
            targetCtx.imageSmoothingEnabled = false;

            if (autoAlign) {
                const cw = maxX - minX + 1;
                const ch = maxY - minY + 1;
                const scale = Math.min((W * 0.85) / cw, (H * 0.85) / ch);
                const dw = cw * scale;
                const dh = ch * scale;
                const dx = (W - dw) / 2;
                const dy = (H - dh) / 2;
                targetCtx.drawImage(img, Math.floor(sx + minX), Math.floor(startY + minY), Math.floor(cw), Math.floor(ch), dx, dy, dw, dh);
            } else {
                // 자동 정렬 비활성화 시: 수동 크롭 영역을 프레임 중앙에 원본 비율로 배치
                const cw = sw;
                const ch = cropHeight;
                const scale = Math.min(W / cw, H / ch);
                const dw = cw * scale;
                const dh = ch * scale;
                const dx = (W - dw) / 2;
                const dy = (H - dh) / 2;
                targetCtx.drawImage(img, sx, startY, cw, ch, dx, dy, dw, dh);
            }

            // 3. 필터 처리 (기존 픽셀 조작 로직)
            const imageData = targetCtx.getImageData(0, 0, W, H);
            let pixels = [];
            for (let y = 0; y < H; y++) {
                const row = [];
                for (let x = 0; x < W; x++) {
                    const i = (y * W + x) * 4;
                    let r = imageData.data[i], g = imageData.data[i + 1], b = imageData.data[i + 2], a = imageData.data[i + 3];
                    const distCheck = Math.sqrt(Math.pow(targetBgColor.r - r, 2) + Math.pow(targetBgColor.g - g, 2) + Math.pow(targetBgColor.b - b, 2));
                    if (distCheck < bgThreshold * 4.4 || a < 50) a = 0;
                    row.push({ r, g, b, a });
                }
                pixels.push(row);
            }

            // 노이즈 제거 및 외곽 처리
            if (removeNoise) {
                const cleaned = pixels.map(r => r.map(p => ({ ...p })));
                for (let y = 0; y < H; y++) {
                    for (let x = 0; x < W; x++) {
                        if (pixels[y][x].a > 0) {
                            let neighbors = 0;
                            for (let dy = -1; dy <= 1; dy++) {
                                for (let dx = -1; dx <= 1; dx++) {
                                    if (dx === 0 && dy === 0) continue;
                                    const ny = y + dy, nx = x + dx;
                                    if (ny >= 0 && ny < H && nx >= 0 && nx < W && pixels[ny][nx].a > 0) neighbors++;
                                }
                            }
                            if (neighbors === 0) cleaned[y][x].a = 0;
                        }
                    }
                }
                pixels = cleaned;
            }

            if (useErosion) {
                const eroded = pixels.map(r => r.map(p => ({ ...p })));
                for (let y = 0; y < H; y++) {
                    for (let x = 0; x < W; x++) {
                        if (pixels[y][x].a > 0) {
                            let isEdge = false;
                            [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dy, dx]) => {
                                const ny = y + dy, nx = x + dx;
                                if (ny < 0 || ny >= H || nx < 0 || nx >= W || pixels[ny][nx].a === 0) isEdge = true;
                            });
                            if (isEdge) eroded[y][x].a = 0;
                        }
                    }
                }
                pixels = eroded;
            }

            data[view] = pixels;
        });
        setPixelData(data);
        setIsProcessing(false);
    };

    useEffect(() => { if (rawImage) runFilters(rawImage); }, [bgThreshold, autoAlign, removeNoise, useErosion, targetBgColor, cropRange, rawImage]);

    useEffect(() => {
        if (!isPlaying || !pixelData) return;
        const interval = setInterval(() => setFrame(f => (f + 1) % 4), 150);
        return () => clearInterval(interval);
    }, [isPlaying, pixelData]);

    const drawToContext = (ctx, data, currentFrame, currentDirection, offX = 0, offY = 0) => {
        const f = currentFrame % 4;
        let pixels = currentDirection === 'down' ? data.front : currentDirection === 'up' ? data.back : data.side;
        if (!pixels) return;
        pixels.forEach((row, y) => row.forEach((p, x) => {
            if (p.a > 10) {
                let dx = (currentDirection === 'right') ? (W - 1 - x) : x;
                let dy = y;
                const isL = y >= legLimit, isT = y >= headLimit && y < legLimit, isH = y < headLimit;

                if (currentDirection === 'down' || currentDirection === 'up') {
                    if (f === 1 || f === 3) {
                        // 몸통은 1px 내려옴
                        dy += 1;

                        // 머리(isH)는 1px 더 내려와서 총 2px 튕김 + 좌우로 까딱거림
                        if (isH) {
                            dy += 1; // 추가 바운스
                            dx += (f === 1 ? 1 : -1); // 좌우 흔들림
                        }

                        if (isL) {
                            const isRightSide = x >= W / 2;
                            if (f === 1 && isRightSide) dy -= 2;
                            else if (f === 3 && !isRightSide) dy -= 2;
                        }
                    }
                } else {
                    const isLDir = currentDirection === 'left';
                    if (f === 1 || f === 3) {
                        if (isL) {
                            const isF = x < W / 2;
                            dx += isF ? ((f === 1) ? -2 : 2) : ((f === 1) ? 2 : -2);
                            if (((f === 1) && isF) || ((f === 3) && !isF)) dy -= 1;
                            else dy += 1;
                        } else {
                            dy += 1;
                            // 측면에서도 머리는 더 튕기게
                            if (isH) dy += 1;
                        }
                    }
                }
                ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.a / 255})`;
                ctx.fillRect(dx + offX, dy + offY, 1, 1);
            }
        }));
    };

    const drawCharacter = (ctx, data, f) => {
        ctx.clearRect(0, 0, W, H);
        drawToContext(ctx, data, f, direction);
        if (showGrid) {
            ctx.strokeStyle = '#eee'; ctx.lineWidth = 0.1;
            for (let i = 0; i <= W; i += 8) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
            for (let i = 0; i <= H; i += 8) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }
        }
        // 다리 라인 (Leg Limit)
        ctx.setLineDash([4, 2]);
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = '#2563eb'; // Blue
        ctx.beginPath();
        ctx.moveTo(0, legLimit); ctx.lineTo(W, legLimit);
        ctx.stroke();

        // 머리 라인 (Head Limit) [RESTORED]
        ctx.strokeStyle = '#ef4444'; // Red
        ctx.beginPath();
        ctx.moveTo(0, headLimit); ctx.lineTo(W, headLimit);
        ctx.stroke();

        ctx.setLineDash([]);
    };

    const downloadFullSheet = (type) => {
        if (!pixelData) return;
        const canvas = document.createElement('canvas');
        canvas.width = W * 6; canvas.height = H * 4;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.imageSmoothingEnabled = false;
            const dirs = ['down', 'up', 'right', 'left'];
            dirs.forEach((dir, r) => { for (let c = 0; c < 6; c++) drawToContext(ctx, pixelData, c, dir, c * W, r * H); });
            const fileName = 'zep-character';
            if (type === 'png') {
                const a = document.createElement('a'); a.download = `${fileName}.png`; a.href = canvas.toDataURL(); a.click();
            } else {
                const atlas = {
                    frames: {}, meta: { app: "Sage Console", version: "1.0", image: `${fileName}.png`, size: { w: W * 6, h: H * 4 }, headLimit, legLimit }
                };
                dirs.forEach((dir, r) => {
                    for (let c = 0; c < 6; c++) {
                        atlas.frames[`${dir}_${c}`] = { frame: { x: c * W, y: r * H, w: W, h: H }, rotated: false, trimmed: false, sourceSize: { w: W, h: H } };
                    }
                });
                const blob = new Blob([JSON.stringify(atlas, null, 2)], { type: 'application/json' });
                const a = document.createElement('a'); a.download = `${fileName}.json`; a.href = URL.createObjectURL(blob); a.click();
            }
        }
    };

    const saveCharacterToDB = async () => {
        if (!pixelData || !charName) {
            alert('캐릭터 이름을 입력해주세요!');
            return;
        }

        setIsProcessing(true);
        try {
            const canvas = document.createElement('canvas');
            canvas.width = W * 6; canvas.height = H * 4;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            const dirs = ['down', 'up', 'right', 'left'];
            dirs.forEach((dir, r) => { for (let c = 0; c < 6; c++) drawToContext(ctx, pixelData, c, dir, c * W, r * H); });

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

            const atlasData = {
                meta: { headLimit, legLimit, size: { w: W * 6, h: H * 4 } },
                frames: {}
            };
            dirs.forEach((dir, r) => {
                for (let c = 0; c < 6; c++) {
                    atlasData.frames[`${dir}_${c}`] = { frame: { x: c * W, y: r * H, w: W, h: H } };
                }
            });

            const formData = new FormData();
            formData.append('characterImage', blob, 'character.png');
            formData.append('name', charName);
            formData.append('atlasData', JSON.stringify(atlasData));

            const response = await fetch('http://localhost:3001/api/character/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                alert('캐릭터가 성공적으로 서버에 저장되었습니다!');
                console.log('Saved:', result);
            } else {
                throw new Error('저장 실패');
            }
        } catch (error) {
            console.error(error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const saveNpcToDB = async () => {
        if (!pixelData || !charName) {
            alert('NPC 이름을 입력해주세요!');
            return;
        }

        setIsProcessing(true);
        try {
            const canvas = document.createElement('canvas');
            canvas.width = W * 6; canvas.height = H * 4;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            const dirs = ['down', 'up', 'right', 'left'];
            dirs.forEach((dir, r) => { for (let c = 0; c < 6; c++) drawToContext(ctx, pixelData, c, dir, c * W, r * H); });

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

            const atlasData = {
                meta: { headLimit, legLimit, size: { w: W * 6, h: H * 4 } },
                frames: {}
            };
            dirs.forEach((dir, r) => {
                for (let c = 0; c < 6; c++) {
                    atlasData.frames[`${dir}_${c}`] = { frame: { x: c * W, y: r * H, w: W, h: H } };
                }
            });

            const formData = new FormData();
            formData.append('npcImage', blob, 'npc.png');
            formData.append('name', charName);
            formData.append('atlasData', JSON.stringify(atlasData));

            const response = await fetch('http://localhost:3001/api/npc/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                alert('NPC가 성공적으로 서버에 저장되었습니다!');
                console.log('Saved NPC:', result);
            } else {
                throw new Error('저장 실패');
            }
        } catch (error) {
            console.error(error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (pixelData && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) { ctx.imageSmoothingEnabled = false; drawCharacter(ctx, pixelData, frame); }
        }
    }, [pixelData, frame, direction, showGrid, headLimit, legLimit]);

    return (
        <div className="character-maker-container">
            <div className="cm-max-w-6xl cm-w-full cm-space-y-6">
                <header className="cm-flex cm-justify-between cm-items-end cm-border-b cm-pb-4 cm-border-gray-100 animate-fade-in-up">
                    <div className="cm-space-y-1">
                        <button
                            onClick={() => navigate(-1)}
                            className="cm-flex cm-items-center cm-gap-2 cm-text-gray-500 cm-hover-text-black cm-mb-4 cm-transition-colors"
                        >
                            <ArrowLeft size={16} /> 돌아가기
                        </button>
                        <h1 className="cm-text-4xl heading-serif cm-font-black">캐릭터 만들기</h1>
                    </div>
                </header>

                <main className="cm-grid grid-cols-1 cm-lg-grid-cols-custom cm-gap-12 cm-items-start">
                    <div className="cm-space-y-8">
                        <section className="glass-card cm-p-10 cm-flex cm-flex-col cm-items-center cm-justify-center cm-border-dashed cm-border animate-fade-in-up delay-100">
                            {!image ? (
                                <div className="cm-flex cm-flex-col cm-items-center cm-gap-4">
                                    <ImageIcon size={48} className="cm-text-gray-300" />
                                    <label className="file-input-label">
                                        캐릭터 이미지 업로드
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleUpload}
                                            accept="image/*"
                                            className="cm-hidden"
                                        />
                                    </label>
                                    <p className="cm-text-xs cm-text-gray-400">48x64 크기의 3프레임 시트를 권장합니다</p>
                                </div>
                            ) : (
                                <div className="cm-flex cm-flex-col cm-items-center cm-space-y-6 cm-w-full">
                                    <div className="cm-relative cm-border cm-p-2 cm-bg-gray-50 cm-transition-transform cm-hover-scale-105 cm-duration-500">
                                        <img src={image} style={{ maxHeight: '180px', width: 'auto' }} className="pixel-grid" />
                                    </div>
                                    <button onClick={() => { setImage(null); setRawImage(null); }} className="toggle-btn cm-flex cm-items-center cm-gap-2">
                                        <RefreshCw size={14} />
                                        소스 교체
                                    </button>
                                </div>
                            )}
                        </section>

                        <section className="glass-card cm-p-8 cm-space-y-8 animate-fade-in-up delay-200">
                            <div className="cm-space-y-4">
                                <h2 className="cm-text-sm cm-font-black cm-uppercase cm-tracking-tighter cm-flex cm-items-center cm-justify-center cm-gap-2"><Camera size={16} /> 설정값</h2>
                                <div className="cm-flex cm-justify-center">
                                    <button onClick={pickColor} className="toggle-btn cm-flex cm-items-center cm-gap-2">
                                        <div className="cm-w-3 cm-h-3 cm-rounded-full cm-border cm-border-gray-300" style={{ backgroundColor: `rgb(${targetBgColor.r},${targetBgColor.g},${targetBgColor.b})` }}></div>
                                        배경색 추출
                                    </button>
                                </div>
                            </div>

                            <div className="cm-space-y-6">
                                <div className="cm-space-y-3">
                                    <div className="cm-flex cm-justify-between cm-text-xs cm-font-bold cm-text-gray-400 cm-uppercase"><span>배경 제거 감도</span><span>{bgThreshold}</span></div>
                                    <input type="range" min="0" max="100" value={bgThreshold} onChange={(e) => setBgThreshold(parseInt(e.target.value))} />
                                </div>
                                <div className="cm-grid grid-cols-3 cm-gap-2">
                                    <button onClick={() => setAutoAlign(!autoAlign)} className={`toggle-btn ${autoAlign ? 'active-blue' : ''}`}>자동 정렬</button>
                                    <button onClick={() => setRemoveNoise(!removeNoise)} className={`toggle-btn ${removeNoise ? 'active-emerald' : ''}`}>노이즈 제거</button>
                                    <button onClick={() => setUseErosion(!useErosion)} className={`toggle-btn ${useErosion ? 'active-amber' : ''}`}>외곽 깎기</button>
                                </div>
                            </div>


                        </section>
                    </div>

                    <section className="glass-card cm-p-10 cm-flex cm-flex-col cm-items-center animate-fade-in-up delay-300 cm-sticky-top">
                        <div className="cm-w-full cm-space-y-10">
                            <h2 className="cm-text-sm cm-font-black cm-uppercase cm-tracking-tighter cm-flex cm-items-center cm-justify-center cm-gap-2"><Sparkles size={16} /> preview</h2>

                            <div
                                className="checkerboard cm-p-12 cm-flex cm-justify-center cm-items-center cm-bg-white cm-group cm-relative"
                                style={{ cursor: 'ns-resize' }}
                                onMouseMove={(e) => {
                                    if (e.buttons !== 1) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const y = Math.max(0, Math.min(64, Math.round(((e.clientY - rect.top) / rect.height) * 64)));

                                    // 가까운 선을 우선적으로 이동
                                    const distToHead = Math.abs(y - headLimit);
                                    const distToLeg = Math.abs(y - legLimit);

                                    if (distToHead < distToLeg) {
                                        setHeadLimit(Math.min(y, legLimit - 5));
                                    } else {
                                        setLegLimit(Math.max(y, headLimit + 5));
                                    }
                                }}
                            >
                                <div className="cm-relative" style={{ width: '240px', height: '320px', zIndex: 10 }}>
                                    <canvas ref={canvasRef} width={W} height={H} style={{ width: '240px', height: '320px', pointerEvents: 'none' }} className="pixel-grid cm-transition-transform cm-duration-700 cm-group-hover-scale-110" />
                                    {/* 머리 라인 툴팁 */}
                                    <div
                                        className="head-tooltip"
                                        style={{ top: `${(headLimit / 64) * 100}%` }}
                                    >
                                        머리 흔들림 경계 (RED)
                                    </div>
                                    {/* 다리 라인 툴팁 */}
                                    <div
                                        className="leg-tooltip"
                                        style={{ top: `${(legLimit / 64) * 100}%` }}
                                    >
                                        골반/다리 움직임 경계 (BLUE)
                                    </div>
                                </div>
                            </div>

                            <div className="cm-space-y-8">
                                <div className="cm-flex cm-justify-center border-b border-gray-100 pb-2">
                                    {['down', 'up', 'left', 'right'].map((d) => (
                                        <button key={d} onClick={() => setDirection(d)} className={`dir-btn ${direction === d ? 'dir-btn-active' : ''}`}>
                                            {d === 'down' ? '앞면' : d === 'up' ? '뒷면' : d === 'left' ? '왼쪽' : '오른쪽'}
                                        </button>
                                    ))}
                                </div>
                                <div className="cm-flex cm-justify-center cm-gap-6">
                                    <button onClick={() => setIsPlaying(!isPlaying)} className="btn-secondary" disabled={!pixelData}>{isPlaying ? <Pause size={18} /> : <Play size={18} />}</button>
                                    <button onClick={() => setShowGrid(!showGrid)} className={`btn-secondary ${showGrid ? 'cm-text-black cm-border-black' : ''}`} disabled={!pixelData}><LayoutGrid size={18} /></button>
                                </div>
                            </div>

                            <div className="cm-flex cm-flex-col cm-gap-3 cm-pt-6 cm-border-t cm-border-gray-100">
                                <div className="cm-space-y-2 cm-mb-2">
                                    <label className="cm-text-xs cm-font-bold cm-text-gray-400 cm-uppercase">캐릭터 이름</label>
                                    <input
                                        type="text"
                                        value={charName}
                                        onChange={(e) => setCharName(e.target.value)}
                                        placeholder="이름을 입력하세요"
                                        className="cm-w-full cm-p-2 cm-border cm-rounded cm-text-sm"
                                    />
                                </div>
                                <button className="btn-luxury-indigo" disabled={!pixelData || !charName} onClick={saveCharacterToDB}>
                                    <Sparkles size={18} /> 서버에 캐릭터 저장하기
                                </button>
                                <button className="btn-luxury-emerald" disabled={!pixelData || !charName} onClick={saveNpcToDB}>
                                    <Sparkles size={18} /> 서버에 NPC로 저장하기
                                </button>
                                <div className="cm-grid grid-cols-2 cm-gap-2">
                                    <button className="btn-secondary cm-text-xs" disabled={!pixelData} onClick={() => downloadFullSheet('png')}><ImageIcon size={14} /> PNG 다운</button>
                                    <button className="btn-secondary cm-text-xs" disabled={!pixelData} onClick={() => downloadFullSheet('json')}><FileJson size={14} /> JSON 다운</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
            {/* Crop Selection Modal */}
            {showCropModal && (
                <div className="crop-modal-overlay">
                    <div className="crop-modal-content glass-card animate-fade-in-up">
                        <div className="crop-modal-header">
                            <h3>영역 선택</h3>
                            <p>캐릭터가 포함된 세로 범위를 마우스로 드래그하여 선택하세요</p>
                        </div>

                        <div
                            className="crop-area-container"
                            onMouseMove={(e) => {
                                if (e.buttons !== 1) return;
                                const rect = e.currentTarget.getBoundingClientRect();
                                if (rect.height === 0) return;
                                const y = ((e.clientY - rect.top) / rect.height) * 100;
                                // 가까운 선을 이동시킴
                                if (Math.abs(y - dragPos.top) < Math.abs(y - dragPos.bottom)) {
                                    setDragPos(prev => ({ ...prev, top: Math.max(0, Math.min(y, prev.bottom - 5)) }));
                                } else {
                                    setDragPos(prev => ({ ...prev, bottom: Math.min(100, Math.max(y, prev.top + 5)) }));
                                }
                            }}
                        >
                            <img
                                src={tempSrc}
                                alt="Crop preview"
                                className="crop-image-preview"
                                onDragStart={(e) => e.preventDefault()}
                                onContextMenu={(e) => e.preventDefault()}
                            />

                            {/* Visual Guides */}
                            <div className="crop-guide-dim" style={{ height: `${dragPos.top}%`, top: 0 }}></div>
                            <div className="crop-guide-dim" style={{ height: `${100 - dragPos.bottom}%`, top: `${dragPos.bottom}%` }}></div>

                            <div className="crop-guide-line top" style={{ top: `${dragPos.top}%` }}>
                                <span className="crop-handle">TOP {Math.round(dragPos.top)}%</span>
                            </div>
                            <div className="crop-guide-line bottom" style={{ top: `${dragPos.bottom}%` }}>
                                <span className="crop-handle">BOTTOM {Math.round(dragPos.bottom)}%</span>
                            </div>
                        </div>

                        <div className="cm-flex cm-gap-4 cm-justify-center cm-mt-8">
                            <button onClick={() => setShowCropModal(false)} className="btn-secondary">취소</button>
                            <button onClick={confirmCrop} className="btn-primary" style={{ backgroundColor: 'black', color: 'white', padding: '0.75rem 2rem' }}>적용하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CharacterMaker;
