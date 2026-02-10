import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const ShopModal = ({ isOpen, onClose, user, onUpdateUser }) => {
    const [items, setItems] = useState([]);
    const [activeTab, setActiveTab] = useState('skin'); // skin, title
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchItems();
        }
    }, [isOpen]);

    const fetchItems = async () => {
        try {
            const res = await axios.get('/api/shop/items');
            setItems(res.data);
        } catch (err) {
            console.error('Fetch items error:', err);
        }
    };

    const handleBuy = async (itemId) => {
        if (!window.confirm('이 아이템을 구매하시겠습니까?')) return;
        setLoading(true);
        try {
            const res = await axios.post('/api/shop/buy', { userId: user.id, itemId });
            alert(res.data.message);
            onUpdateUser(res.data.user);
        } catch (err) {
            alert(err.response?.data?.message || '구매 실패');
        } finally {
            setLoading(false);
        }
    };

    const handleEquip = async (itemId, category) => {
        setLoading(true);
        try {
            const res = await axios.post('/api/shop/equip', { userId: user.id, itemId, category });
            onUpdateUser(res.data.user);
        } catch (err) {
            alert(err.response?.data?.message || '장착 실패');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredItems = items.filter(item => item.category === activeTab);

    return (
        <div className="shop-overlay">
            <motion.div
                className="shop-container"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <div className="shop-header">
                    <h2>SAFE_SHOP</h2>
                    <div className="user-points-display">
                        <span className="p-label">MY POINTS:</span>
                        <span className="p-val">{(user.points || 0).toLocaleString()} P</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>CLOSE</button>
                </div>

                <div className="shop-tabs">
                    <button className={activeTab === 'skin' ? 'active' : ''} onClick={() => setActiveTab('skin')}>CHARACTER_SKIN</button>
                    <button className={activeTab === 'title' ? 'active' : ''} onClick={() => setActiveTab('title')}>HONOR_TITLES</button>
                </div>

                <div className="shop-content">
                    <div className="items-grid">
                        {filteredItems.map(item => {
                            const isOwned = user.inventory?.some(i => i.itemId === item.id);
                            const isEquipped = item.category === 'skin'
                                ? user.equippedSkin === item.id
                                : user.equippedTitle === item.name;

                            return (
                                <div key={item.id} className={`item-card ${isEquipped ? 'equipped' : ''}`}>
                                    <div className="item-preview">
                                        {item.category === 'skin' ? (
                                            <div className="skin-preview-box">
                                                <div className={`skin-rect ${item.id}`}></div>
                                            </div>
                                        ) : (
                                            <div className="title-preview-box">[{item.name}]</div>
                                        )}
                                    </div>
                                    <div className="item-info">
                                        <h3 className="item-name">{item.name}</h3>
                                        <p className="item-desc">{item.description}</p>
                                        <div className="item-price">
                                            {isOwned ? (
                                                <span className="owned-tag">OWNED</span>
                                            ) : (
                                                <span className="price-tag">{item.price.toLocaleString()} P</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="item-footer">
                                        {isOwned ? (
                                            <button
                                                className={`equip-btn ${isEquipped ? 'active' : ''}`}
                                                disabled={isEquipped || loading}
                                                onClick={() => handleEquip(item.id, item.category)}
                                            >
                                                {isEquipped ? 'EQUIPPED' : 'EQUIP'}
                                            </button>
                                        ) : (
                                            <button
                                                className="buy-btn"
                                                disabled={loading || user.points < item.price}
                                                onClick={() => handleBuy(item.id)}
                                            >
                                                BUY_ITEM
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            <style>{`
                .shop-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.85);
                    z-index: 3000; display: flex; align-items: center; justify-content: center;
                    padding: 40px; font-family: 'Space Grotesk', sans-serif;
                    pointer-events: auto !important;
                }
                .shop-container {
                    background: #fff; border: 2px solid #000; width: 100%; max-width: 1200px;
                    height: 85vh; display: flex; flex-direction: column; overflow: hidden;
                    box-shadow: 20px 20px 0px #000;
                    pointer-events: auto !important;
                }
                .shop-header { padding: 30px; border-bottom: 2px solid #000; display: flex; justify-content: space-between; align-items: center; }
                .shop-header h2 { font-weight: 800; font-size: 2rem; letter-spacing: -1px; }
                .user-points-display { background: #000; color: #fff; padding: 10px 20px; font-family: 'IBM Plex Mono', monospace; }
                .p-label { font-size: 10px; opacity: 0.7; margin-right: 10px; }
                .p-val { font-weight: 700; font-size: 18px; color: #FFD700; }
                .close-btn { background: none; border: 2px solid #000; padding: 10px 20px; font-weight: 700; cursor: pointer; }

                .shop-tabs { display: flex; border-bottom: 2px solid #000; }
                .shop-tabs button { 
                    flex: 1; padding: 20px; border: none; background: #fff; border-right: 2px solid #000; 
                    font-weight: 700; cursor: pointer; font-size: 14px; transition: 0.2s;
                }
                .shop-tabs button.active { background: #000; color: #fff; }
                
                .shop-content { flex: 1; overflow-y: auto; padding: 40px; background: #f5f5f5; }
                .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 30px; }
                
                .item-card { background: #fff; border: 2px solid #000; display: flex; flex-direction: column; transition: 0.2s; position: relative; }
                .item-card.equipped { border-color: #FF5C00; box-shadow: 8px 8px 0px rgba(255, 92, 0, 0.2); border-width: 4px; }
                .item-preview { height: 180px; background: #eee; border-bottom: 2px solid #000; display: flex; align-items: center; justify-content: center; }
                
                .skin-preview-box { width: 60px; height: 100px; background: #aaa; border: 2px solid #000; display: flex; align-items: flex-end; justify-content: center; }
                .skin-rect { width: 40px; height: 60px; }
                .skin-rect.skin_fire { background: #FF5C00; }
                .skin-rect.skin_water { background: #00F2FF; }
                .skin-rect.skin_gold { background: #FFD700; box-shadow: 0 0 15px gold; }
                .skin-rect.skin_default { background: #333; }

                .title-preview-box { font-family: 'IBM Plex Mono', monospace; font-weight: 800; font-size: 18px; color: #FF5C00; text-align: center; padding: 0 10px; }
                
                .item-info { padding: 20px; flex: 1; }
                .item-name { font-weight: 800; font-size: 1.2rem; margin-bottom: 8px; }
                .item-desc { font-size: 12px; opacity: 0.6; margin-bottom: 20px; line-height: 1.4; }
                .item-price { font-family: 'IBM Plex Mono', monospace; font-weight: 700; margin-top: auto; }
                .price-tag { color: #000; }
                .owned-tag { color: #00BFA5; }

                .item-footer { padding: 15px; border-top: 1px dashed #ddd; }
                .buy-btn, .equip-btn { 
                    width: 100%; padding: 12px; border: 2px solid #000; font-weight: 700; cursor: pointer; transition: 0.2s;
                    background: #fff;
                }
                .buy-btn:hover:not(:disabled) { background: #FF5C00; color: #fff; }
                .buy-btn:disabled { opacity: 0.3; cursor: not-allowed; }
                .equip-btn.active { background: #000; color: #fff; cursor: default; }
                .equip-btn:hover:not(.active) { background: #000; color: #fff; }
            `}</style>
        </div>
    );
};

export default ShopModal;
