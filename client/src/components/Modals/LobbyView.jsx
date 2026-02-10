import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '../../services/socket';
import useGameStore from '../../store/useGameStore'; // [추가] 최신 유저 정보 사용용

const LobbyView = ({ isOpen, onClose, stageName }) => {
    const socket = getSocket();
    const { userStats } = useGameStore();
    const chatBoxRef = React.useRef(null); // [수정] 채팅 전용 컨테이너 레퍼런스
    const [viewState, setViewState] = useState('LIST');
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [formTitle, setFormTitle] = useState(`${userStats.username || user.username || '익명'}의 작전실`);
    const [formMaxPlayers, setFormMaxPlayers] = useState(4);

    // 채팅 및 감정표현 상태 [NEW]
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [activeEmotes, setActiveEmotes] = useState({}); // { playerId: emoteId }

    // [수정] 채팅 박스 전용 자동 스크롤 로직 (전체 화면 스크롤 방지)
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!isOpen) return;

        socket.emit('getRooms');

        socket.on('roomsUpdated', (updatedRooms) => setRooms(updatedRooms));

        socket.on('roomJoined', (room) => {
            setSelectedRoom(room);
            setViewState('ROOM');
        });

        // 게임 시작 이벤트 수신
        socket.on('startGame', (data) => {
            console.log('[Lobby] Game starting...', data);

            // 실제 게임 페이지로 이동 (stageId와 roomId 전달)
            // stageName이 한글 이름이라면 숫자로 변환
            const stageNum = (data.stageId === 'BURN_FIRST_AID' || data.stageId === '화상 시 대처 방법') ? 1
                : (data.stageId === 'FIRE_EVAC_DRILL' || data.stageId === '화재 대피 훈련') ? 2
                    : 3;

            window.location.href = `/game?stage=${stageNum}&roomId=${data.roomId}`;
        });

        // 채팅 수신 [NEW]
        socket.on('chatMessageReceived', (msg) => {
            setMessages(prev => [...prev.slice(-50), msg]); // 최대 50개 유지
        });

        // 감정표현 수신 [NEW]
        socket.on('emoteReceived', (data) => {
            setActiveEmotes(prev => ({ ...prev, [data.senderId]: data.emoteId }));
            setTimeout(() => {
                setActiveEmotes(prev => {
                    const next = { ...prev };
                    delete next[data.senderId];
                    return next;
                });
            }, 3000); // 3초 뒤 삭제
        });

        return () => {
            socket.off('roomsUpdated');
            socket.off('roomJoined');
            socket.off('startGame');
            socket.off('chatMessageReceived');
            socket.off('emoteReceived');
        };
    }, [isOpen]);

    const openCreateForm = () => {
        setFormTitle(`${userStats.username || user.username}의 작전실`);
        setFormMaxPlayers(4);
        setViewState('CREATE');
    };

    const handleCreateRoom = (e) => {
        if (e) e.preventDefault();
        const roomData = {
            title: formTitle,
            hostName: userStats.username || user.username,
            maxPlayers: parseInt(formMaxPlayers),
            stageId: stageName,
            skin: userStats.equippedSkin || 'skin_default',
            titleName: userStats.equippedTitle || '초보 구조대',
            customCharacter: userStats.customCharacter || null
        };
        socket.emit('createRoom', roomData);
    };

    const handleJoinRoom = (roomId) => {
        socket.emit('joinRoom', roomId, {
            username: userStats.username || user.username,
            skin: userStats.equippedSkin || 'skin_default',
            titleName: userStats.equippedTitle || '초보 구조대',
            customCharacter: userStats.customCharacter || null
        });
    };

    const handleLeaveRoom = () => {
        if (selectedRoom) {
            socket.emit('leaveRoom', selectedRoom.id);
            setSelectedRoom(null);
        }
        setViewState('LIST');
    };

    // 레디 버튼 클릭 핸들러 [NEW]
    const handleToggleReady = () => {
        if (selectedRoom) {
            socket.emit('playerReady', selectedRoom.id);
        }
    };

    // 게임 시작 클릭 핸들러 [NEW]
    const handleStartGame = () => {
        if (selectedRoom) {
            socket.emit('startGame', selectedRoom.id);
        }
    };

    // 채팅 전송 핸들러 [NEW]
    const handleSendChat = (e) => {
        if (e) e.preventDefault();
        if (!chatInput.trim() || !selectedRoom) return;

        socket.emit('sendChatMessage', {
            roomId: selectedRoom.id,
            message: chatInput,
            senderName: user.username
        });
        setChatInput('');
    };

    // 감정표현 전송 핸들러 [NEW]
    const handleSendEmote = (emoteId) => {
        if (!selectedRoom) return;
        socket.emit('sendEmote', {
            roomId: selectedRoom.id,
            emoteId,
            senderName: user.username
        });
    };

    if (!isOpen) return null;

    // 내 정보 찾기
    const myInfo = selectedRoom?.players.find(p => p.id === socket.id);
    const isHost = myInfo?.role === 'host';
    const allReadyExceptHost = selectedRoom?.players
        .filter(p => p.role !== 'host')
        .every(p => p.isReady);

    const renderSlots = () => {
        const slots = [];
        for (let i = 0; i < (selectedRoom?.maxPlayers || 4); i++) {
            const player = selectedRoom?.players[i];
            const activeEmote = player ? activeEmotes[player.id] : null;

            slots.push(
                <div key={i} className={`player-slot ${player ? 'active' : 'empty'}`}>
                    <div className="slot-frame">
                        <AnimatePresence>
                            {activeEmote && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0, scale: 0.5 }}
                                    animate={{ y: 0, opacity: 1, scale: 1.2 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="emote-bubble"
                                >
                                    {activeEmote}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {player ? (
                            <div className="avatar-wrapper">
                                {player.titleName && <span className="p-title-tag">{player.titleName}</span>}
                                {player.role === 'host' && <span className="host-badge">HOST</span>}

                                {player.customCharacter ? (
                                    <div
                                        className={`avatar-real-v ${player.skin || 'skin_default'}`}
                                        style={{
                                            backgroundImage: `url(${player.customCharacter.imagePath})`,
                                            backgroundSize: '576px 512px',
                                            backgroundPosition: '0 0',
                                            width: '96px',
                                            height: '128px',
                                            imageRendering: 'pixelated'
                                        }}
                                    ></div>
                                ) : (
                                    <div className={`avatar-placeholder-rect ${player.skin || 'skin_default'}`}></div>
                                )}
                            </div>
                        ) : (
                            <span className="empty-txt">WAITING...</span>
                        )}
                    </div>
                    <div className="player-info-bar">
                        <span className="p-name">{player ? player.name : '---'}</span>
                        {player && player.role !== 'host' && (
                            <span className={`p-status ${player.isReady ? 'ready' : ''}`}>
                                {player.isReady ? 'READY' : '...'}
                            </span>
                        )}
                    </div>
                </div>
            );
        }
        return slots;
    };

    return (
        <div className="lobby-overlay">
            <motion.div
                className="lobby-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="lobby-header">
                    <div className="header-info">
                        <span className="stage-tag">{stageName}</span>
                        <h2>
                            {viewState === 'LIST' && '대기실'}
                            {viewState === 'CREATE' && '대기실'}
                            {viewState === 'ROOM' && selectedRoom?.title}
                        </h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>X_CLOSE</button>
                </div>

                <div className="lobby-content">
                    {viewState === 'LIST' && (
                        <div className="room-list-view">
                            <div className="list-controls">
                                <button className="create-room-btn" onClick={openCreateForm}>
                                    + NEW_ROOM_CREATE
                                </button>
                            </div>
                            <div className="room-grid">
                                {rooms.length === 0 && <p className="empty-msg">현재 생성된 방이 없습니다.</p>}
                                {rooms.map(room => (
                                    <div key={room.id} className="room-card" onClick={() => handleJoinRoom(room.id)}>
                                        <div className="card-top">
                                            <span className="room-no">HOST: {room.hostName}</span>
                                            <span className="room-host">STAGE: {room.stageId}</span>
                                        </div>
                                        <h3 className="room-title">{room.title}</h3>
                                        <div className="card-footer">
                                            <span className="member-count">{room.players.length} / {room.maxPlayers}</span>
                                            <button className="enter-btn">ENTER_JOIN</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {viewState === 'CREATE' && (
                        <div className="create-form-view">
                            <form onSubmit={handleCreateRoom} className="designer-form">
                                <div className="form-row">
                                    <div className="form-group title-group">
                                        <label>ROOM_TITLE</label>
                                        <input
                                            type="text"
                                            value={formTitle}
                                            onChange={(e) => setFormTitle(e.target.value)}
                                            placeholder="방 제목을 입력하세요"
                                            required
                                        />
                                    </div>
                                    <div className="form-group scale-group">
                                        <label>MAX_PLAYERS (2-6)</label>
                                        <input
                                            type="number"
                                            min="2" max="6"
                                            value={formMaxPlayers}
                                            onChange={(e) => setFormMaxPlayers(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="secondary-btn" onClick={() => setViewState('LIST')}>CANCEL</button>
                                    <button type="submit" className="primary-btn">CREATE_&_ENTER</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {viewState === 'ROOM' && (
                        <div className="room-detail-view">
                            <div className="room-layout-main">
                                <div className="slots-side">
                                    <div className="player-slots-container">
                                        {renderSlots()}
                                    </div>
                                </div>

                                <div className="right-side-col">
                                    <div className="chat-side">
                                        <div className="chat-box" ref={chatBoxRef}>
                                            {messages.length === 0 && <p className="chat-empty">동료들과 대화를 나눠보세요!</p>}
                                            {messages.map((m, idx) => (
                                                <div key={idx} className={`chat-line ${m.senderId === socket.id ? 'is-me' : ''}`}>
                                                    <span className="c-name">{m.senderName}</span>
                                                    <span className="c-msg">{m.message}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="emote-selector-mini">
                                            {['👍', '🔥', '❓', '😮', '🤣', '💖'].map(emote => (
                                                <button key={emote} onClick={() => handleSendEmote(emote)} className="emote-btn-mini">
                                                    {emote}
                                                </button>
                                            ))}
                                        </div>
                                        <form onSubmit={handleSendChat} className="chat-input-row">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder="메시지 입력..."
                                            />
                                            <button type="submit">전송</button>
                                        </form>
                                    </div>

                                    <div className="side-actions-v">
                                        {isHost ? (
                                            <button
                                                className={`start-btn-full ${!allReadyExceptHost ? 'disabled' : ''}`}
                                                disabled={!allReadyExceptHost}
                                                onClick={handleStartGame}
                                            >
                                                {allReadyExceptHost ? 'MISSION_START' : 'WAITING_FOR_READY...'}
                                            </button>
                                        ) : (
                                            <button
                                                className={`ready-btn-full ${myInfo?.isReady ? 'is-ready' : ''}`}
                                                onClick={handleToggleReady}
                                            >
                                                {myInfo?.isReady ? 'CANCEL_READY' : 'READY_NOW'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="room-actions-footer">
                                <button className="back-btn" onClick={handleLeaveRoom}>← EXIT_LOBBY</button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            <style>{`
                .lobby-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.9);
                    z-index: 2000; display: flex; align-items: flex-start; justify-content: center;
                    padding: 0; font-family: var(--font-main);
                }
                .lobby-container {
                    background: var(--color-bg); border-bottom: var(--border-main);
                    width: 100vw; height: 100vh;
                    display: flex; flex-direction: column; position: relative;
                }
                .lobby-header { padding: 8px 30px; border-bottom: var(--border-main); display: flex; justify-content: space-between; align-items: center; background: #fff; }
                .stage-tag { font-family: var(--font-mono); font-size: 8px; color: var(--color-accent); font-weight: 700; margin-bottom: 0px; display: block; }
                .lobby-header h2 { font-size: 1.1rem; font-weight: 800; letter-spacing: -0.5px; }
                .close-btn { background: none; border: var(--border-main); padding: 4px 12px; font-family: var(--font-mono); font-size: 10px; font-weight: 700; cursor: pointer; }

                .lobby-content { flex: 1; overflow-y: auto; padding: 20px 40px 20px 20px; }

                /* Room List Mode */
                .create-room-btn { 
                    background: var(--color-text); color: #fff; border: none; padding: 15px 30px;
                    font-family: var(--font-mono); font-weight: 700; cursor: pointer; transition: 0.2s; margin-bottom: 30px;
                }
                .room-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
                .room-card { background: #fff; border: var(--border-main); padding: 25px; cursor: pointer; transition: 0.2s; box-shadow: 4px 4px 0px #1A1A1A; }
                .room-card:hover { transform: translate(-4px, -4px); box-shadow: 8px 8px 0px var(--color-accent); }
                .card-top { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 10px; opacity: 0.5; margin-bottom: 15px; }
                .room-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 20px; }
                .member-count { font-family: var(--font-mono); font-weight: 700; font-size: 14px; }

                /* Create Form Mode */
                .create-form-view { max-width: 1400px; margin: 20px 0; }
                .designer-form { display: flex; flex-direction: column; gap: 25px; }
                .form-row { display: flex; gap: 20px; align-items: flex-end; }
                .title-group { flex: 3; }
                .scale-group { flex: 1; }
                .form-group { display: flex; flex-direction: column; gap: 10px; }
                .form-group label { font-family: var(--font-mono); font-size: 12px; font-weight: 700; }
                .form-group input { 
                    padding: 15px; border: var(--border-main); font-size: 1.1rem; 
                    font-family: var(--font-main); outline: none;
                }
                .form-group input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 4px rgba(255, 92, 0, 0.1); }
                
                .form-actions { display: flex; gap: 15px; margin-top: 20px; }
                .primary-btn { flex: 1; background: var(--color-text); color: #fff; border: none; padding: 18px; font-weight: 700; cursor: pointer; }
                .secondary-btn { background: #fff; border: var(--border-main); padding: 18px; font-weight: 700; cursor: pointer; }

                /* Room Detail Mode */
                .room-layout-main { display: flex; gap: 30px; margin-bottom: 30px; flex: 1; min-height: 0; }
                .slots-side { flex: 2; display: flex; flex-direction: column; gap: 20px; }
                .chat-side { 
                    width: 350px; height: 280px; 
                    display: flex; flex-direction: column; 
                    background: #fff; border: var(--border-main);
                    align-self: flex-start;
                }
                
                .player-slots-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
                .player-slot { background: #fff; border: var(--border-main); display: flex; flex-direction: column; height: 280px; }
                .player-slot.empty { background: #fafafa; border-style: dashed; opacity: 0.6; }
                .player-slot.active { box-shadow: 6px 6px 0px #000; border-width: 2px; }
                
                .slot-frame { flex: 1; display: flex; align-items: flex-end; justify-content: center; padding: 20px; position: relative; }
                .avatar-wrapper { display: flex; flex-direction: column; align-items: center; gap: 5px; }
                .p-title-tag { font-family: var(--font-mono); font-size: 8px; background: #FF5C00; color: #fff; padding: 2px 6px; border-radius: 10px; }
                .avatar-placeholder-rect, .avatar-real-v { width: 96px; height: 128px; border: 2.5px solid #000; background-color: rgba(255,255,255,0.05); }
                
                .avatar-placeholder-rect.skin_default, .avatar-real-v.skin_default { background-color: rgba(0,0,0,0.1); }
                .avatar-placeholder-rect.skin_fire, .avatar-real-v.skin_fire { box-shadow: 0 0 20px #FF5C00; border-color: #FF5C00; }
                .avatar-placeholder-rect.skin_water, .avatar-real-v.skin_water { box-shadow: 0 0 20px #00f2ff; border-color: #00f2ff; }
                .avatar-placeholder-rect.skin_gold, .avatar-real-v.skin_gold { box-shadow: 0 0 30px #FFD700; border-color: #FFD700; }

                .right-side-col { width: 350px; display: flex; flex-direction: column; gap: 15px; }
                .chat-side { 
                    width: 100%; height: 280px; 
                    display: flex; flex-direction: column; 
                    background: #fff; border: var(--border-main);
                }

                .side-actions-v { width: 100%; }
                .start-btn-full, .ready-btn-full {
                    width: 100%; padding: 20px; font-weight: 800; font-size: 1.1rem;
                    border: var(--border-main); cursor: pointer; box-shadow: 6px 6px 0px #000;
                    transition: 0.2s;
                }
                .start-btn-full { background: var(--color-accent); color: #fff; }
                .start-btn-full.disabled { background: #eee; color: #999; cursor: not-allowed; box-shadow: none; }
                .ready-btn-full { background: #fff; color: #000; }
                .ready-btn-full.is-ready { background: #00BFA5; color: #fff; }
                .start-btn-full:not(.disabled):hover, .ready-btn-full:hover { transform: translate(-2px, -2px); box-shadow: 8px 8px 0px #000; }

                .room-actions-footer { border-top: 1px dashed #ccc; padding-top: 20px; margin-top: auto; padding-bottom: 20px; }
                .back-btn { background: #fff; border: var(--border-main); padding: 18px 40px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .back-btn:hover { background: #eee; }

                .host-badge { position: absolute; top: 10px; right: 10px; font-size: 8px; background: #000; color: #fff; padding: 2px 6px; font-family: var(--font-mono); z-index: 50; }
                .empty-txt { font-family: var(--font-mono); font-size: 10px; opacity: 0.3; }

                .emote-bubble {
                    position: absolute; top: 7px; left: 0; width: 100%;
                    text-align: center;
                    font-size: 3rem; z-index: 100;
                    pointer-events: none;
                    text-shadow: 0 4px 10px rgba(0,0,0,0.2);
                }

                .player-info-bar { padding: 10px; border-top: var(--border-main); background: #f9f9f9; display: flex; justify-content: space-between; align-items: center; }
                .p-name { font-weight: 700; font-size: 13px; }
                .p-status.ready { color: #00BFA5; font-weight: 800; }

                .emote-selector-mini { 
                    display: flex; gap: 8px; padding: 8px 15px; 
                    background: #fdfdfd; border-top: 1px solid #eee; 
                    justify-content: flex-start;
                }
                .emote-btn-mini { 
                    background: none; border: none; font-size: 1.2rem; 
                    cursor: pointer; transition: transform 0.2s; padding: 0;
                }
                .emote-btn-mini:hover { transform: scale(1.4); }

                /* Chat Styling */
                .chat-box { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
                .chat-empty { opacity: 0.3; text-align: center; margin-top: 20px; font-family: var(--font-mono); font-size: 11px; }
                .chat-line { display: flex; gap: 8px; }
                .chat-line.is-me { background: #f0f7ff; margin: 0 -10px; padding: 2px 10px; }
                .c-name { font-weight: 800; color: var(--color-accent); min-width: fit-content; }
                .c-msg { color: #333; word-break: break-all; }

                .chat-input-row { display: flex; border-top: var(--border-main); }
                .chat-input-row input { flex: 1; padding: 12px; border: none; outline: none; font-size: 13px; }
                .chat-input-row button { background: var(--color-text); color: #fff; border: none; padding: 0 20px; font-weight: 700; cursor: pointer; }
            `}</style>
        </div>
    );
};

export default LobbyView;
