/**
 * ==============================================================================
 * 歷史情境模擬 RPG - MOBA 戰場引擎與走位抉擇系統 (MOBA Game Engine)
 * ==============================================================================
 */

// 1. 金幣與暴擊全屏粒子系統 (Coin Particle VFX)
class CoinParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(window.innerWidth * this.dpr);
    this.canvas.height = Math.round(window.innerHeight * this.dpr);
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
  }

  burst(x, y, count = 35) {
    if (!this.ctx) return;
    const originX = x || window.innerWidth / 2;
    const originY = y || window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 11 + 4;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        gravity: 0.38,
        radius: Math.random() * 8 + 6,
        color: ['#facc15', '#fbbf24', '#f59e0b', '#fef08a', '#ffffff'][Math.floor(Math.random() * 5)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 16,
        alpha: 1.0,
        decay: Math.random() * 0.02 + 0.012
      });
    }
    if (!this.animating) {
      this.animating = true;
      this.loop();
    }
  }

  loop() {
    if (!this.ctx) return;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.scale(this.dpr || 1, this.dpr || 1);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;
      p.rotation += p.rotSpeed;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);

      // 外外金幣
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // 清代銅錢方孔
      this.ctx.fillStyle = '#070a12';
      this.ctx.fillRect(-p.radius * 0.28, -p.radius * 0.28, p.radius * 0.56, p.radius * 0.56);

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// 2. 核心 MOBA 控制器與戰場渲染類 (GameController)
class GameController {
  constructor() {
    this.models = window.GAME_MODELS;
    this.state = null;
    this.coinVFX = null;

    // 戰場畫布與相機
    this.canvas = null;
    this.ctx = null;
    this.minimapCanvas = null;
    this.minimapCtx = null;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.viewWidth = window.innerWidth;
    this.viewHeight = window.innerHeight;

    // 地圖與世界邊界 (擴展為 2600 寬闊遊樂場大地圖，連結東西時空渡口)
    this.worldWidth = 2600;
    this.worldHeight = 1000;
    this.camera = { x: 0, y: 0 };
    this.isTransitioningEra = false;
    this._lastBarrierWarning = 0;

    // 英雄角色物件
    this.hero = {
      x: 520,
      y: 300,
      vx: 0,
      vy: 0,
      speed: 3.8,
      radius: 22,
      facing: 0, // 弧度
      isMoving: false,
      walkFrame: 0,
      sprintTimer: 0,
      ghostTrails: [],
      queueJoints: []
    };

    // 時代 NPC 群像與環境物件
    this.npcs = [];
    this.ambientParticles = [];
    this.seagulls = [];

    // 輸入控制
    this.keys = {};
    this.joystick = {
      active: false,
      startX: 0,
      startY: 0,
      vectorX: 0,
      vectorY: 0
    };

    // 技能與 CD
    this.skillCooldowns = {
      sprint: 0,
      radar: 0
    };
    this.activeRadarBeam = 0; // 導引雷達剩餘時間

    // 當前接觸的抉擇建築/區域
    this.currentContactZone = null;
    this.zoneStayTimer = 0; // 停留自動確認計時
    this.minigameClicksLeft = 3;

    // 漂浮字列表
    this.floatingTexts = [];

    // 遊戲運行時間
    this.gameStartTime = Date.now();
    this.ambientLightTick = 0;

    // 玩家主要本體身份 (主要身份：名為林晨恩，貫穿全場、跨時空永久成長，通關越來越強)
    this.playerMaster = {
      name: '林晨恩',
      masterTitle: '時空歷史行者',
      totalReputation: 20,
      totalKnowledge: 30,
      masterTierLevel: 1,
      masterRelics: ['relic_starter_bamboo_basket'],
      completedEras: [],
      discoveredLandmarks: []
    };
  }

  // 跨時代本尊數值同步與位階晉升
  syncMasterProgress(repDelta = 0, knowDelta = 0) {
    if (!this.playerMaster) return;
    this.playerMaster.totalReputation += repDelta;
    this.playerMaster.totalKnowledge += knowDelta;
    const totalPoints = this.playerMaster.totalReputation + this.playerMaster.totalKnowledge;
    const tiers = this.models.MASTER_PROGRESSION_TIERS || [];
    let targetTier = tiers[0];
    for (const t of tiers) {
      if (totalPoints >= t.minPoints) {
        targetTier = t;
      }
    }
    if (targetTier && targetTier.level > this.playerMaster.masterTierLevel) {
      this.playerMaster.masterTierLevel = targetTier.level;
      if (window.soundFx) window.soundFx.playLevelUp();
      this.coinVFX.burst(window.innerWidth / 2, window.innerHeight / 2, 60);
      this.showToast(`👑 本尊晉升！時空位階升至【${targetTier.name}】！`);
      this.addFloatingText(this.hero.x, this.hero.y - 70, `👑 晉升！${targetTier.name}`, '#f59e0b', 24);
      this.saveMasterProfile();
    } else {
      this.saveMasterProfile();
    }
  }

  // 永久儲存歷史行者檔案至 localStorage
  saveMasterProfile() {
    if (!this.playerMaster) return;
    try {
      localStorage.setItem('taiwan_rpg_master_profile', JSON.stringify(this.playerMaster));
    } catch (e) {
      console.warn('無法儲存歷史行者本尊檔案至 localStorage:', e);
    }
  }

  // 從 localStorage 還原歷史行者檔案
  loadMasterProfile() {
    try {
      const saved = localStorage.getItem('taiwan_rpg_master_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('讀取歷史行者本尊檔案失敗:', e);
    }
    return null;
  }

  // 永久儲存當前正在進行的時空角色活躍階段 (讓角色進度延續，重新整理不歸零)
  saveActiveSession() {
    if (!this.state || !this.currentEra || !this.currentPerspective) return;
    try {
      const sessionData = {
        eraId: this.state.eraId,
        identityId: this.state.identityId,
        silver: this.state.silver,
        reputation: this.state.reputation,
        knowledge: this.state.knowledge,
        tierLevel: this.state.tierLevel,
        unlockedClues: this.state.unlockedClues || [],
        inventoryCollectibles: this.state.inventoryCollectibles || [],
        currentNodeId: this.state.currentNodeId,
        choiceHistory: this.state.choiceHistory || [],
        historicalDecisionsCount: this.state.historicalDecisionsCount || 0,
        heroX: (this.hero && typeof this.hero.x === 'number') ? Math.round(this.hero.x) : 700,
        heroY: (this.hero && typeof this.hero.y === 'number') ? Math.round(this.hero.y) : 420,
        savedAt: Date.now()
      };
      // 1. 儲存當前活躍 session
      localStorage.setItem('taiwan_rpg_active_session', JSON.stringify(sessionData));

      // 2. 同步記錄在多角色階段字典中，切換不同角色也能保留進度
      let allSessions = {};
      try {
        const raw = localStorage.getItem('taiwan_rpg_saved_sessions');
        if (raw) allSessions = JSON.parse(raw) || {};
      } catch (e) {}
      allSessions[this.state.identityId] = sessionData;
      localStorage.setItem('taiwan_rpg_saved_sessions', JSON.stringify(allSessions));
    } catch (e) {
      console.warn('無法儲存即時角色階段至 localStorage:', e);
    }
  }

  // 從 localStorage 還原當前時空角色的活躍進度
  loadActiveSession(eraId = null, identityId = null) {
    try {
      // 若指定了特定人物，優先讀取該人物的專案紀錄
      if (identityId) {
        const raw = localStorage.getItem('taiwan_rpg_saved_sessions');
        if (raw) {
          const allSessions = JSON.parse(raw);
          if (allSessions && allSessions[identityId]) {
            return allSessions[identityId];
          }
        }
      }
      // 否則讀取全局最新活躍階段
      const saved = localStorage.getItem('taiwan_rpg_active_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.eraId && parsed.identityId) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('讀取即時角色進度失敗:', e);
    }
    return null;
  }

  // 清除活躍階段 (例如重溫歷史新開局時)
  clearActiveSession(identityId = null) {
    try {
      if (identityId) {
        const raw = localStorage.getItem('taiwan_rpg_saved_sessions');
        if (raw) {
          const allSessions = JSON.parse(raw) || {};
          delete allSessions[identityId];
          localStorage.setItem('taiwan_rpg_saved_sessions', JSON.stringify(allSessions));
        }
      }
      localStorage.removeItem('taiwan_rpg_active_session');
    } catch (e) {
      console.warn('清除即時遊戲階段失敗:', e);
    }
  }

  // 開啟自訂行者本尊姓名彈窗
  promptRenameMaster() {
    if (window.soundFx) window.soundFx.playClick();
    const modal = document.getElementById('rename-modal');
    const input = document.getElementById('input-master-name');
    if (input && this.playerMaster) {
      input.value = this.playerMaster.name || '林晨恩';
    }
    if (modal) {
      modal.classList.remove('hidden');
      if (input) setTimeout(() => input.focus(), 150);
    }
  }

  // 確認自訂行者本尊姓名
  confirmRenameMaster() {
    const input = document.getElementById('input-master-name');
    if (!input) return;
    const newName = input.value.trim();
    if (!newName) {
      this.showToast('⚠️ 請輸入有效的歷史行者姓名！', 2500);
      return;
    }
    if (this.playerMaster) {
      this.playerMaster.name = newName;
      this.saveMasterProfile();
    }
    this.closeModal('rename-modal');
    if (window.soundFx) window.soundFx.playLevelUp();
    this.showToast(`🎉 歷史行者本尊姓名已自訂為【${newName}】！將永久貫穿七大時代！`, 3500);
    this.renderHUD();
    this.showIdentityModal();

    // 更新戰報與其他 DOM 顯示
    const reportSub = document.getElementById('report-master-sub');
    if (reportSub && this.currentEra) {
      reportSub.innerText = `本尊行者：${this.playerMaster.name} ｜ 結算年代：${this.currentEra.year}`;
    }
  }

  // 地標初次造訪見聞 (降低情報與閱歷獲取門檻，輕鬆獲得及時反饋)
  checkLandmarkDiscovery(loc) {
    if (!loc || loc.id === 'loc_player_home' || loc.id === 'loc_smuggler') return;
    if (!this.playerMaster.discoveredLandmarks) this.playerMaster.discoveredLandmarks = [];
    const discoveryKey = `${this.currentEraId}_${loc.id}`;
    if (!this.playerMaster.discoveredLandmarks.includes(discoveryKey)) {
      this.playerMaster.discoveredLandmarks.push(discoveryKey);

      let clueToAward = null;
      if (this.currentEraId === 'era_1869_open_port') {
        if (loc.id === 'loc_tea_firm') clueToAward = 'clue_western_firms';
        else if (loc.id === 'loc_customs') clueToAward = 'clue_customs_tax';
        else if (loc.id === 'loc_sugar_guild') clueToAward = 'clue_fujian_guild';
        else if (loc.id === 'loc_dock') clueToAward = 'clue_dock_trade';
      } else if (this.currentEraId === 'era_1642_voc') {
        clueToAward = 'clue_voc_deer';
      } else if (this.currentEraId === 'era_1920_modern') {
        if (loc.id === 'loc_tea_firm') clueToAward = 'clue_1920_petition';
        else if (loc.id === 'loc_dock') clueToAward = 'clue_railway_trade';
      }

      if (clueToAward && !this.state.unlockedClues.includes(clueToAward)) {
        this.rewardClue(clueToAward);
      } else {
        this.syncMasterProgress(10, 15);
        this.state.knowledge += 15;
        this.renderHUD();
      }
      this.showToast(`🔍 探索見聞：初次造訪【${loc.name}】！獲得史學見聞！`);
      this.addFloatingText(this.hero.x, this.hero.y - 50, '🔍 探索見聞 +15 閱歷！', '#38bdf8', 20);
    }
  }

  init() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    this.coinVFX = new CoinParticleSystem('coin-canvas');
    this.resetGame();
    this.initEnvironmentAndNPCs();
    this.resizeCanvases();
    window.addEventListener('resize', () => this.resizeCanvases());

    this.bindInputs();
    this.bindJoystick();
    this.renderHUD();

    // 啟動主渲染迴圈
    requestAnimationFrame((t) => this.gameLoop(t));

    // 監聽頁面即將卸載或重新整理，確保最新狀態毫秒級存檔
    window.addEventListener('beforeunload', () => {
      this.saveActiveSession();
      this.saveMasterProfile();
    });

    // 首次進入遊戲，直接進入當前時代歷練，顯示歡迎導引 Toast
    setTimeout(() => {
      this.showToast(`📜 歷史時空啟程：【${this.currentEra ? this.currentEra.year : ''} ${this.currentEra ? this.currentEra.title : ''}】！扮演【${this.state.identityName}】展開臺灣歷史情境演繹！`, 4500);
    }, 450);
  }

  initEnvironmentAndNPCs() {
    // 1. 初始化主角清代長辮物理骨節 (僅在清領時期有長辮)
    this.hero.queueJoints = [];
    if (this.currentEraId === 'era_04_early_qing' || this.currentEraId === 'era_05_late_qing' || this.currentEraId === 'era_1869_open_port') {
      for (let i = 0; i < 6; i++) {
        this.hero.queueJoints.push({ x: this.hero.x, y: this.hero.y + i * 5 });
      }
    }

    // 2. 時代市井 NPC 群像 (分佈於寬敞大道，動態載入對應時代專屬群像)
    if (this.models.ERA_NPCS && this.models.ERA_NPCS[this.currentEraId]) {
      this.npcs = JSON.parse(JSON.stringify(this.models.ERA_NPCS[this.currentEraId]));
    } else {
      this.npcs = [
        {
          id: 'npc_coolie',
          name: '挑茶苦力 · 阿福',
          role: '碼頭挑夫',
          x: 540,
          y: 680,
          baseX: 540,
          baseY: 680,
          type: 'coolie',
          facing: 1,
          talk: '深坑的烏龍茶剛送到！得趕緊挑去寶順洋行秤重裝箱！'
        },
        {
          id: 'npc_dodd',
          name: '約翰·陶德 (Dodd)',
          role: '洋商創始人',
          x: 980,
          y: 220,
          baseX: 980,
          baseY: 220,
          type: 'westerner',
          facing: -1,
          talk: 'Formosa Oolong tea will conquer New York and London!'
        },
        {
          id: 'npc_comprador',
          name: '買辦 · 李春生',
          role: '茶業買辦',
          x: 820,
          y: 360,
          baseX: 820,
          baseY: 360,
          type: 'scholar',
          facing: 1,
          talk: '承恩，開港乃百年難遇之良機，與洋行聯手方能將臺灣茶推向海外！'
        },
        {
          id: 'npc_apprentice',
          name: '行郊學徒 · 阿木',
          role: '糖郊夥計',
          x: 380,
          y: 220,
          baseX: 380,
          baseY: 220,
          type: 'apprentice',
          facing: -1,
          talk: '掌櫃說過，近來兩岸商路風浪大，郊商銀錢吃緊，還是守成穩健好。'
        },
        {
          id: 'npc_guard',
          name: '正關巡勇 · 杜把總',
          role: '淡水正關巡防',
          x: 980,
          y: 580,
          baseX: 980,
          baseY: 580,
          type: 'guard',
          facing: -1,
          talk: '海關正嚴查無稅私運！膽敢闖入西南私渡口，定依新關章程究辦！'
        },
        {
          id: 'npc_boatman',
          name: '渡船船伕 · 林老漢',
          role: '淡水河擺渡',
          x: 820,
          y: 750,
          baseX: 820,
          baseY: 750,
          type: 'boatman',
          facing: 1,
          talk: '潮水正旺，來往艋舺與滬尾的行商舢舨隨時可渡！'
        }
      ];
    }

    // 3. 環境氛圍飄浮粒子 (史前為玉光石英星火，清代為茶葉微粒與燈星)
    this.ambientParticles = [];
    const isPrehistoric = this.currentEraId === 'era_01_prehistory';
    for (let i = 0; i < 45; i++) {
      this.ambientParticles.push({
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        vx: (Math.random() - 0.2) * 0.7,
        vy: Math.random() * 0.4 + 0.1,
        size: Math.random() * 3 + 1.8,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        alpha: Math.random() * 0.5 + 0.2,
        type: isPrehistoric ? (Math.random() < 0.6 ? 'jadespark' : 'spark') : (Math.random() < 0.65 ? 'tealeaf' : 'spark')
      });
    }

    // 4. 水域海鷗
    this.seagulls = [
      { x: 260, y: 560, vx: 1.1, vy: -0.15, wing: 0 },
      { x: 650, y: 620, vx: -0.95, vy: 0.1, wing: 1.8 },
      { x: 850, y: 580, vx: 0.85, vy: -0.1, wing: 3.2 }
    ];
  }

  resizeCanvases() {
    if (!this.canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.viewWidth = window.innerWidth;
    this.viewHeight = window.innerHeight;

    // 主畫布高清分辨率
    this.canvas.width = Math.round(this.viewWidth * this.dpr);
    this.canvas.height = Math.round(this.viewHeight * this.dpr);
    this.canvas.style.width = this.viewWidth + 'px';
    this.canvas.style.height = this.viewHeight + 'px';

    // 小地圖高清分辨率 (135x135)
    if (this.minimapCanvas) {
      const mw = 135;
      const mh = 135;
      this.minimapCanvas.width = Math.round(mw * this.dpr);
      this.minimapCanvas.height = Math.round(mh * this.dpr);
      this.minimapCanvas.style.width = mw + 'px';
      this.minimapCanvas.style.height = mh + 'px';
    }

    // 粒子系統畫布
    if (this.coinVFX && this.coinVFX.canvas) {
      this.coinVFX.resize();
    }
  }

  resetGame(eraId = null, identityId = null, isFreshStart = false, spawnPosition = null) {
    const saved = this.loadMasterProfile();

    // 確保本尊玩家資料存在 (跨時代累積，優先從 localStorage 還原)
    if (!this.playerMaster) {
      this.playerMaster = {
        name: (saved && saved.name) || '林晨恩',
        masterTitle: (saved && saved.masterTitle) || '時空歷史行者',
        totalReputation: (saved && saved.totalReputation !== undefined) ? saved.totalReputation : 20,
        totalKnowledge: (saved && saved.totalKnowledge !== undefined) ? saved.totalKnowledge : 30,
        masterTierLevel: (saved && saved.masterTierLevel) || 1,
        masterRelics: (saved && Array.isArray(saved.masterRelics)) ? saved.masterRelics : ['relic_starter_bamboo_basket'],
        completedEras: (saved && Array.isArray(saved.completedEras)) ? saved.completedEras : [],
        completedPerspectives: (saved && Array.isArray(saved.completedPerspectives)) ? saved.completedPerspectives : [],
        unlockedEras: (saved && Array.isArray(saved.unlockedEras) && saved.unlockedEras.length > 0) ? saved.unlockedEras : ['era_01_prehistory'],
        lastActiveEraId: (saved && saved.lastActiveEraId) || 'era_01_prehistory',
        lastActivePerspectiveId: (saved && saved.lastActivePerspectiveId) || 'changbin_hunter',
        homeLevel: (saved && saved.homeLevel) || 1,
        currentOutfit: (saved && saved.currentOutfit) || 'outfit_peasant',
        unlockedOutfits: (saved && Array.isArray(saved.unlockedOutfits)) ? saved.unlockedOutfits : ['outfit_peasant'],
        accumulatedRent: (saved && saved.accumulatedRent) || 0,
        rentTimer: (saved && saved.rentTimer) || 0,
        discoveredLandmarks: (saved && Array.isArray(saved.discoveredLandmarks)) ? saved.discoveredLandmarks : []
      };
    } else {
      if (!this.playerMaster.masterRelics.includes('relic_starter_bamboo_basket')) {
        this.playerMaster.masterRelics.push('relic_starter_bamboo_basket');
      }
      this.playerMaster.homeLevel = this.playerMaster.homeLevel || 1;
      this.playerMaster.currentOutfit = this.playerMaster.currentOutfit || 'outfit_peasant';
      this.playerMaster.unlockedOutfits = this.playerMaster.unlockedOutfits || ['outfit_peasant'];
      this.playerMaster.accumulatedRent = this.playerMaster.accumulatedRent || 0;
      this.playerMaster.rentTimer = this.playerMaster.rentTimer || 0;
      this.playerMaster.completedEras = this.playerMaster.completedEras || [];
      this.playerMaster.completedPerspectives = this.playerMaster.completedPerspectives || [];
      this.playerMaster.unlockedEras = this.playerMaster.unlockedEras || ['era_01_prehistory'];
    }

    const savedSession = isFreshStart ? null : this.loadActiveSession(eraId, identityId);

    // 時代篇章驗證：優先讀取存檔中的活躍時代
    let candidateEraId = eraId || (savedSession && savedSession.eraId) || (saved && saved.lastActiveEraId) || 'era_01_prehistory';
    let eraIdx = this.models.HISTORICAL_ERAS.findIndex(e => e.id === candidateEraId);
    if (eraIdx === -1 || !this.isEraUnlocked(eraIdx)) {
      // 僅在完全找不到時代時回退第 1 章
      candidateEraId = 'era_01_prehistory';
      eraIdx = 0;
    }

    const era = this.models.HISTORICAL_ERAS[eraIdx];
    this.currentEraId = era.id;
    this.currentEra = era;
    this.models.MAP_LOCATIONS = this.models.ERA_MAP_LOCATIONS[era.id] || this.models.ERA_MAP_LOCATIONS.era_01_prehistory;

    // 人物視角驗證：優先精準延續最後遊玩角色，絕不在重新整理時退回第 1 關
    let candidateIdentityId = identityId;
    if (!candidateIdentityId && savedSession && savedSession.eraId === era.id && savedSession.identityId) {
      candidateIdentityId = savedSession.identityId;
    } else if (!candidateIdentityId && saved && saved.lastActiveEraId === era.id && saved.lastActivePerspectiveId) {
      candidateIdentityId = saved.lastActivePerspectiveId;
    } else if (!candidateIdentityId && era.perspectives && era.perspectives.length > 0) {
      candidateIdentityId = era.defaultIdentityId || era.perspectives[0].id;
    }

    let pIndex = era.perspectives.findIndex(p => p.id === candidateIdentityId);
    if (pIndex === -1) {
      pIndex = 0;
    } else if (!this.isPerspectiveUnlocked(era, pIndex)) {
      // 若為存檔明確記載的當前角色，直接允許載入
      const isRecordedActive = (savedSession && savedSession.identityId === candidateIdentityId) ||
                               (saved && saved.lastActivePerspectiveId === candidateIdentityId);
      if (!isRecordedActive) {
        pIndex = 0;
      }
    }

    const perspective = era.perspectives[pIndex];
    this.currentPerspective = perspective;

    // 同步本尊檔案最後活躍記錄，並即刻存檔矯正舊資料
    this.playerMaster.lastActiveEraId = this.currentEraId;
    this.playerMaster.lastActivePerspectiveId = this.currentPerspective.id;
    this.saveMasterProfile();

    // 時代初始情報
    const startingClues = [];
    if (perspective.startingClueId) {
      startingClues.push(perspective.startingClueId);
    } else if (era.id === 'era_02_international' || era.id === 'era_1642_voc') {
      startingClues.push('clue_voc_deer');
    } else if (era.id === 'era_05_late_qing' || era.id === 'era_1869_open_port') {
      startingClues.push('clue_dadaocheng_tea');
    } else if (era.id === 'era_06_japanese_rule' || era.id === 'era_1920_modern') {
      startingClues.push('clue_clinical_notes');
    } else {
      startingClues.push('clue_changbin_flaked_stone');
    }

    // 檢查是否有即時遊玩進度可供延續 (同一時代與人物，且非強制重置)
    const canRestore = !isFreshStart &&
                       savedSession &&
                       savedSession.eraId === era.id &&
                       savedSession.identityId === perspective.id;

    if (canRestore) {
      // ✅ 完美延續角色進度：重新整理絕不歸零！
      this.state = {
        eraId: era.id,
        identityId: perspective.id,
        identityName: perspective.name,
        identityTitle: perspective.title,
        roleType: perspective.roleType,
        roleTypeBadge: perspective.roleTypeBadge,
        perspectiveFocus: perspective.perspectiveFocus,
        missionObjective: perspective.missionObjective,
        avatar: perspective.avatar,
        silver: (typeof savedSession.silver === 'number' && !isNaN(savedSession.silver)) ? savedSession.silver : perspective.initialSilver,
        reputation: (typeof savedSession.reputation === 'number' && !isNaN(savedSession.reputation)) ? savedSession.reputation : perspective.initialReputation,
        knowledge: (typeof savedSession.knowledge === 'number' && !isNaN(savedSession.knowledge)) ? savedSession.knowledge : perspective.initialKnowledge,
        tierLevel: savedSession.tierLevel || 1,
        homeLevel: this.playerMaster.homeLevel,
        currentOutfit: this.playerMaster.currentOutfit,
        unlockedOutfits: [...this.playerMaster.unlockedOutfits],
        accumulatedRent: this.playerMaster.accumulatedRent,
        rentTimer: this.playerMaster.rentTimer,
        unlockedClues: (Array.isArray(savedSession.unlockedClues) && savedSession.unlockedClues.length > 0) ? [...savedSession.unlockedClues] : startingClues,
        inventoryCollectibles: (Array.isArray(savedSession.inventoryCollectibles) && savedSession.inventoryCollectibles.length > 0) ? [...savedSession.inventoryCollectibles] : [...this.playerMaster.masterRelics],
        currentNodeId: (savedSession.currentNodeId && this.models.EVENT_NODES[savedSession.currentNodeId]) ? savedSession.currentNodeId : perspective.firstNodeId,
        choiceHistory: Array.isArray(savedSession.choiceHistory) ? savedSession.choiceHistory : [],
        historicalDecisionsCount: savedSession.historicalDecisionsCount || 0
      };
      if (spawnPosition === 'west') {
        this.hero.x = -500;
        this.hero.y = 420;
      } else if (spawnPosition === 'east') {
        this.hero.x = 2200;
        this.hero.y = 420;
      } else {
        // 每次換角色、下一關或載入新關卡，一律回到起始點 (中間 700, 420)，絕不預先移動到目標建築
        this.hero.x = 700;
        this.hero.y = 420;
      }
    } else {
      this.state = {
        eraId: era.id,
        identityId: perspective.id,
        identityName: perspective.name,
        identityTitle: perspective.title,
        roleType: perspective.roleType,
        roleTypeBadge: perspective.roleTypeBadge,
        perspectiveFocus: perspective.perspectiveFocus,
        missionObjective: perspective.missionObjective,
        avatar: perspective.avatar,
        silver: perspective.initialSilver,
        reputation: perspective.initialReputation,
        knowledge: perspective.initialKnowledge,
        tierLevel: 1,
        homeLevel: this.playerMaster.homeLevel,
        currentOutfit: this.playerMaster.currentOutfit,
        unlockedOutfits: [...this.playerMaster.unlockedOutfits],
        accumulatedRent: this.playerMaster.accumulatedRent,
        rentTimer: this.playerMaster.rentTimer,
        unlockedClues: startingClues,
        inventoryCollectibles: [...this.playerMaster.masterRelics],
        currentNodeId: perspective.firstNodeId,
        choiceHistory: [],
        historicalDecisionsCount: 0
      };
      if (spawnPosition === 'west') {
        this.hero.x = -500;
        this.hero.y = 420;
      } else if (spawnPosition === 'east') {
        this.hero.x = 2200;
        this.hero.y = 420;
      } else {
        // 每次換角色/下一關起始點統一設為中間起始點 (700, 420)
        this.hero.x = 700;
        this.hero.y = 420;
      }
      this.saveActiveSession();
    }

    // 英雄狀態與地圖環境初始化 (確保回到中央起始點，無任何殘留尋路或速度)
    this.hero.vx = 0;
    this.hero.vy = 0;
    this.hero.isMoving = false;
    this.hero.navTarget = null;
    this.currentContactZone = null;
    this.hideZonePromptBubble();

    // 相機平滑對齊中央起始點 (700, 420)
    const vW = this.viewWidth || window.innerWidth;
    const vH = this.viewHeight || window.innerHeight;
    this.camera.x = 700 - vW / 2;
    this.camera.y = 420 - vH / 2;

    this.initEnvironmentAndNPCs();
  }

  getCurrentTier() {
    const sorted = [...this.models.PROGRESSION_TIERS].reverse();
    const current = sorted.find(t => this.state.silver >= t.minSilver);
    return current || this.models.PROGRESSION_TIERS[0];
  }

  checkTierProgression() {
    const newTier = this.getCurrentTier();
    if (newTier.level > this.state.tierLevel) {
      this.state.tierLevel = newTier.level;
      if (window.soundFx) window.soundFx.playLevelUp();
      this.showTierUpModal(newTier);
    }
  }

  // ======================== 主遊戲邏輯迴圈 ========================
  gameLoop() {
    this.update();
    this.render();
    this.renderMinimap();
    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    this.ambientLightTick += 0.03;

    // 1. 處理技能冷卻
    if (this.skillCooldowns.sprint > 0) {
      this.skillCooldowns.sprint -= 1 / 60;
      const el = document.getElementById('cd-sprint');
      if (el) {
        if (this.skillCooldowns.sprint > 0) {
          el.innerText = `${Math.ceil(this.skillCooldowns.sprint)}s`;
          el.style.opacity = '1';
        } else {
          el.style.opacity = '0';
        }
      }
    }

    if (this.skillCooldowns.radar > 0) {
      this.skillCooldowns.radar -= 1 / 60;
      const el = document.getElementById('cd-radar');
      if (el) {
        if (this.skillCooldowns.radar > 0) {
          el.innerText = `${Math.ceil(this.skillCooldowns.radar)}s`;
          el.style.opacity = '1';
        } else {
          el.style.opacity = '0';
        }
      }
    }

    if (this.activeRadarBeam > 0) {
      this.activeRadarBeam -= 1 / 60;
    }
    if (this.radarPulseTimer > 0) {
      this.radarPulseTimer -= 1 / 60;
    }

    // 家宅商號店租分紅累積 (調整為每 90 秒產出一次，健康平衡經濟)
    const currentHomeLevel = (this.playerMaster && this.playerMaster.homeLevel) || (this.state && this.state.homeLevel) || 1;
    if (this.state && currentHomeLevel > 1) {
      this.state.rentTimer = (this.state.rentTimer || 0) + 1 / 60;
      if (this.playerMaster) this.playerMaster.rentTimer = this.state.rentTimer;
      if (this.state.rentTimer >= 90) {
        this.state.rentTimer = 0;
        if (this.playerMaster) this.playerMaster.rentTimer = 0;
        const currentTier = this.models.HOME_TIERS[currentHomeLevel - 1];
        if (currentTier && currentTier.rentPerInterval > 0) {
          const newRent = ((this.playerMaster && this.playerMaster.accumulatedRent) || this.state.accumulatedRent || 0) + currentTier.rentPerInterval;
          if (this.playerMaster) this.playerMaster.accumulatedRent = newRent;
          this.state.accumulatedRent = newRent;
          this.showToast(`💰 林晨恩家族商邸產生了 ${currentTier.rentPerInterval} 兩店租分紅，可隨時回宅領取！`);
          const rentDisplay = document.getElementById('home-accumulated-rent');
          if (rentDisplay) rentDisplay.innerText = `${newRent} 兩`;
        }
      }
    }

    // 2. 角色移動計算 (鍵盤與虛擬搖桿融合)
    let moveX = 0;
    let moveY = 0;

    // 當任何全螢幕彈窗或戰報卡開啟時，停止地圖移動，防止背景誤走
    if (this.isAnyModalOpen()) {
      this.hero.isMoving = false;
      this.hero.navTarget = null;
    } else {
      // 鍵盤輸入 (WASD / 方向鍵)
      if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

      // 虛擬搖桿輸入 (手機觸控/滑鼠拖曳)
      if (this.joystick.active) {
        moveX += this.joystick.vectorX;
        moveY += this.joystick.vectorY;
      }
    }

    // 計算向量長度
    const len = Math.hypot(moveX, moveY);
    if (len > 0.08) {
      // 鍵盤或搖桿主動操作，取消點擊尋路
      this.hero.navTarget = null;
      const dirX = moveX / len;
      const dirY = moveY / len;
      this.hero.facing = Math.atan2(dirY, dirX);

      // 基礎跑速與家宅被動跑速加成
      let currentSpeed = this.hero.speed;
      if (this.state && this.state.homeLevel >= 4) {
        currentSpeed *= 1.25;
      } else if (this.state && this.state.homeLevel >= 2) {
        currentSpeed *= 1.1;
      }

      // 衝刺加成 (疾跑)
      if (this.hero.sprintTimer > 0) {
        this.hero.sprintTimer -= 1 / 60;
        currentSpeed *= 1.8;

        // 衝刺殘影
        if (Math.random() < 0.4) {
          this.hero.ghostTrails.push({
            x: this.hero.x,
            y: this.hero.y,
            alpha: 0.6,
            facing: this.hero.facing
          });
        }
      }

      this.hero.x += dirX * currentSpeed;
      this.hero.y += dirY * currentSpeed;
      this.hero.isMoving = true;
      this.hero.walkFrame += 0.22;

      // 腳步聲
      if (window.soundFx && Math.random() < 0.2) window.soundFx.playStep();
    } else if (this.hero.navTarget) {
      // 自動尋路平滑移動至目標點 (Click-to-Move / Tap-to-Navigate)
      const dx = this.hero.navTarget.x - this.hero.x;
      const dy = this.hero.navTarget.y - this.hero.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 8) {
        this.hero.navTarget = null;
        this.hero.isMoving = false;
      } else {
        const dirX = dx / dist;
        const dirY = dy / dist;
        this.hero.facing = Math.atan2(dirY, dirX);

        let currentSpeed = this.hero.speed;
        if (this.hero.sprintTimer > 0) {
          this.hero.sprintTimer -= 1 / 60;
          currentSpeed *= 1.8;
          if (Math.random() < 0.4) {
            this.hero.ghostTrails.push({
              x: this.hero.x,
              y: this.hero.y,
              alpha: 0.6,
              facing: this.hero.facing
            });
          }
        }

        const step = Math.min(currentSpeed, dist);
        this.hero.x += dirX * step;
        this.hero.y += dirY * step;
        this.hero.isMoving = true;
        this.hero.walkFrame += 0.22;

        if (window.soundFx && Math.random() < 0.2) window.soundFx.playStep();
      }
    } else {
      this.hero.isMoving = false;
    }

    // 限制在世界邊界內 (允許主角向西探索至西方星軌渡口 -750，向東至 2550)
    this.hero.x = Math.max(-750, Math.min(2550, this.hero.x));
    this.hero.y = Math.max(50, Math.min(this.worldHeight - 50, this.hero.y));

    // 檢查東方時空界線與躍遷判定 (往右走跨越至下一個年代/時空)
    const curEraIdx = this.models.HISTORICAL_ERAS.findIndex(e => e.id === this.currentEraId);
    const nextEraIdx = curEraIdx !== -1 ? (curEraIdx + 1) % this.models.HISTORICAL_ERAS.length : 0;
    const nextEra = this.models.HISTORICAL_ERAS[nextEraIdx];
    const isEraCompleted = this.isCurrentEraCompleted();
    const canCrossToNext = isEraCompleted && !this.hasActiveQuest();

    if (!canCrossToNext) {
      // 🔒 尚未全通關或任務進行中：東方邊界 x >= 1840 形成時空封印壁障！
      if (this.hero.x >= 1840) {
        this.hero.x = 1840;
        this.hero.vx = -2.5;
        if (this.hero.navTarget && this.hero.navTarget.x > 1830) {
          this.hero.navTarget = null;
        }
        if (!this._lastBarrierWarning || Date.now() - this._lastBarrierWarning > 2500) {
          this._lastBarrierWarning = Date.now();
          if (window.soundFx) {
            if (window.soundFx.playCritical) window.soundFx.playCritical();
            else window.soundFx.playClick();
          }
          if (this.hasActiveQuest()) {
            this.showToast(`🔒 任務進行中！請先完成當前角色【${this.state.identityName}】的歷史抉擇任務，再行穿越時空！`, 4000);
            this.addFloatingText(this.hero.x, this.hero.y - 50, '🔒 請先完成角色歷史抉擇！', '#f43f5e', 22);
          } else {
            const curEraPerspectives = this.currentEra ? (this.currentEra.perspectives || []) : [];
            const totalCount = curEraPerspectives.length;
            const doneCount = curEraPerspectives.filter(p => this.playerMaster && this.playerMaster.completedPerspectives && this.playerMaster.completedPerspectives.includes(p.id)).length;
            this.showToast(`🔒 尚未全破！需通關本時代【${this.currentEra.title}】全部角色視角（目前 ${doneCount}/${totalCount}），方可開啟東方渡口！可查閱上方【📜 秘笈】！`, 4000);
            this.addFloatingText(this.hero.x, this.hero.y - 50, `🔒 需全角色通關 (${doneCount}/${totalCount})！`, '#f43f5e', 22);
          }
        }
      }
    } else {
      // ✨ 已全破關且無進行中任務：玩家一直往右走，踏入東方時空渡口 (x >= 1860) 即可跨越至下一個年代！
      if (this.hero.x >= 1860) {
        this.jumpToNextEraSpacetime(nextEra.id);
      }
    }

    // 檢查西方時空回溯渡口 (向左遠離工坊走出城鎮，踏入西方時空渡口 x <= -620，可穿越至上一時空/循環時空)
    const prevEraIdx = curEraIdx > 0 ? curEraIdx - 1 : this.models.HISTORICAL_ERAS.length - 1;
    const prevEra = this.models.HISTORICAL_ERAS[prevEraIdx];
    if (this.hero.x <= -620) {
      this.jumpToPrevEraSpacetime(prevEra.id);
    }

    // 殘影衰減
    for (let i = this.hero.ghostTrails.length - 1; i >= 0; i--) {
      this.hero.ghostTrails[i].alpha -= 0.04;
      if (this.hero.ghostTrails[i].alpha <= 0) {
        this.hero.ghostTrails.splice(i, 1);
      }
    }

    // 3. 相機跟隨英雄平滑移動 (考慮頂部與左側 HUD 遮擋，適度擴展視野邊界)
    const vW = this.viewWidth || window.innerWidth;
    const vH = this.viewHeight || window.innerHeight;
    const targetCamX = this.hero.x - vW / 2;
    const targetCamY = this.hero.y - vH / 2;

    // 頂部有約 80px 的常駐主資訊欄，左側有約 250px 的側邊欄與情報卡
    // 允許相機向頂部 (-160) 與向左側深度延伸 (-950)，確保西方大道、星盤廣場與時空渡口完整清晰可見
    const minCamX = -950;
    const minCamY = -160;
    const maxCamX = Math.max(minCamX, this.worldWidth - vW + 160);
    const maxCamY = Math.max(minCamY, this.worldHeight - vH + 140);

    const clampedTargetCamX = Math.max(minCamX, Math.min(maxCamX, targetCamX));
    const clampedTargetCamY = Math.max(minCamY, Math.min(maxCamY, targetCamY));
    this.camera.x += (clampedTargetCamX - this.camera.x) * 0.1;
    this.camera.y += (clampedTargetCamY - this.camera.y) * 0.1;

    // 4. 更新清代長辮動態物理 (Queue hair physics)
    if (this.hero.queueJoints && this.hero.queueJoints.length > 0) {
      // 辮根固定於後腦勺
      const headBehindAngle = this.hero.facing + Math.PI;
      const rootX = this.hero.x + Math.cos(headBehindAngle) * 11;
      const rootY = this.hero.y + Math.sin(headBehindAngle) * 11;
      this.hero.queueJoints[0].x = rootX;
      this.hero.queueJoints[0].y = rootY;

      // 鏈式骨節物理約束
      for (let i = 1; i < this.hero.queueJoints.length; i++) {
        const prev = this.hero.queueJoints[i - 1];
        const cur = this.hero.queueJoints[i];
        const dx = cur.x - prev.x;
        const dy = cur.y - prev.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const segmentLen = 5.2;
        cur.x = prev.x + (dx / dist) * segmentLen;
        cur.y = prev.y + (dy / dist) * segmentLen;
      }
    }

    // 5. 更新環境飄浮粒子與水域海鷗
    if (this.ambientParticles) {
      for (const p of this.ambientParticles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        if (p.x > this.worldWidth) p.x = 0;
        if (p.x < 0) p.x = this.worldWidth;
        if (p.y > this.worldHeight) p.y = 0;
        if (p.y < 0) p.y = this.worldHeight;
      }
    }
    if (this.seagulls) {
      for (const sg of this.seagulls) {
        sg.x += sg.vx;
        sg.y += sg.vy;
        sg.wing += 0.22;
        if (sg.x < 0) sg.x = this.worldWidth;
        if (sg.x > this.worldWidth) sg.x = 0;
      }
    }

    // 6. 檢測英雄走入的選項法陣或建築區域
    this.checkZoneTriggers();

    // 7. 漂浮字更新
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.8;
      ft.alpha -= 0.015;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // 檢測當前位置與選項法陣的接觸
  checkZoneTriggers() {
    // 當任意全螢幕彈窗、戰報卡或結算介面開啟時，絕對禁止觸發或彈出地面選項氣泡
    if (this.isAnyModalOpen()) {
      if (this.currentZoneKey) {
        this.currentZoneKey = null;
        this.currentContactZone = null;
        this.hideZonePromptBubble();
      }
      return;
    }

    const currentNode = this.models.EVENT_NODES[this.state.currentNodeId];
    if (!currentNode) {
      if (this.currentZoneKey) {
        this.currentZoneKey = null;
        this.currentContactZone = null;
        this.hideZonePromptBubble();
      }
      return;
    }

    let nearestZone = null;
    let minDistance = 38; // 觸發半徑 (精準光圈感應，防止逛街誤觸)

    // 檢查自家商邸 (始終可互動：建造/換裝/領租金)
    const homeLoc = this.models.MAP_LOCATIONS.find(l => l.id === 'loc_player_home');
    if (homeLoc) {
      const d = Math.hypot(this.hero.x - homeLoc.doorX, this.hero.y - homeLoc.doorY);
      if (d < minDistance) {
        nearestZone = {
          location: homeLoc,
          isPlayerHome: true,
          distance: d
        };
      }
    }

    // 檢查碼頭棧房 (始終可互動打工)
    if (!nearestZone) {
      const dockLoc = this.models.MAP_LOCATIONS.find(l => l.id === 'loc_dock');
      if (dockLoc) {
        const d = Math.hypot(this.hero.x - dockLoc.doorX, this.hero.y - dockLoc.doorY);
        if (d < minDistance) {
          nearestZone = {
            location: dockLoc,
            isDockMinigame: true,
            distance: d
          };
        }
      }
    }

    // 檢查當前歷史節點的各大商行選項
    if (!nearestZone) {
      for (let i = 0; i < currentNode.options.length; i++) {
        const opt = currentNode.options[i];
        const loc = this.models.MAP_LOCATIONS.find(l => l.id === opt.targetLocationId);
        if (!loc) continue;

        const d = Math.hypot(this.hero.x - loc.doorX, this.hero.y - loc.doorY);
        if (d < minDistance) {
          nearestZone = {
            location: loc,
            option: opt,
            optionIndex: i,
            distance: d
          };
          break;
        }
      }
    }

    // 檢查東方時空長河躍遷渡口 (Next Era Portal)
    const curEraIdx = this.models.HISTORICAL_ERAS.findIndex(e => e.id === this.currentEraId);
    const nextEraIdx = curEraIdx !== -1 ? (curEraIdx + 1) % this.models.HISTORICAL_ERAS.length : 0;
    const nextEra = this.models.HISTORICAL_ERAS[nextEraIdx];
    const isNextUnlocked = this.isCurrentEraCompleted() && !this.hasActiveQuest();

    if (!nearestZone && nextEra) {
      const portalX = 1880;
      const portalY = 420;
      const d = Math.hypot(this.hero.x - portalX, this.hero.y - portalY);
      if (d < 150) {
        nearestZone = {
          isSpacetimePortal: true,
          nextEra: nextEra,
          isUnlocked: isNextUnlocked,
          doorX: portalX,
          doorY: portalY,
          distance: d
        };
      }
    }

    // 檢查西方時空回溯門 (Prev Era Portal)
    if (!nearestZone) {
      const prevEraIdx = curEraIdx > 0 ? curEraIdx - 1 : this.models.HISTORICAL_ERAS.length - 1;
      const prevEra = this.models.HISTORICAL_ERAS[prevEraIdx];
      const portalX = -650;
      const portalY = 420;
      const d = Math.hypot(this.hero.x - portalX, this.hero.y - portalY);
      if (d < 150) {
        nearestZone = {
          isPrevSpacetimePortal: true,
          prevEra: prevEra,
          doorX: portalX,
          doorY: portalY,
          distance: d
        };
      }
    }

    // 狀態轉移與懸浮卡更新 (修正：僅在接觸區域改變時更新 DOM，避免每幀重繪導致點擊事件失效)
    if (nearestZone) {
      const zoneKey = nearestZone.isPlayerHome ? 'home' : (
        nearestZone.isDockMinigame ? 'dock' : (
          nearestZone.isSpacetimePortal ? 'spacetime_next' : (
            nearestZone.isPrevSpacetimePortal ? 'spacetime_prev' : `${nearestZone.location ? nearestZone.location.id : 'loc'}_${nearestZone.optionIndex}`
          )
        )
      );
      if (this.currentZoneKey !== zoneKey) {
        this.currentZoneKey = zoneKey;
        this.currentContactZone = nearestZone;
        this.showZonePromptBubble(nearestZone);
        if (nearestZone.location) {
          this.checkLandmarkDiscovery(nearestZone.location);
        }
      }
    } else {
      if (this.currentZoneKey) {
        this.currentZoneKey = null;
        this.currentContactZone = null;
        this.hideZonePromptBubble();
      }
    }
  }

  showZonePromptBubble(zone) {
    const bubble = document.getElementById('zone-prompt-bubble');
    if (!bubble) return;
    const confirmBtn = document.getElementById('bubble-confirm-btn');

    // 點擊氣泡內部不穿透至畫布
    bubble.onclick = (e) => e.stopPropagation();
    bubble.onpointerdown = (e) => e.stopPropagation();

    const currency = (this.currentEra && this.currentEra.currencyUnit) || '兩';
    const homeName = (this.currentEra && this.currentEra.homeName) || '家族宅邸';
    const workAction = (this.currentEra && this.currentEra.workActionName) || '打工';

    if (zone.isPlayerHome) {
      const homeTier = this.models.HOME_TIERS[this.state.homeLevel - 1] || this.models.HOME_TIERS[0];
      document.getElementById('bubble-icon').innerText = '🏡';
      document.getElementById('bubble-loc-name').innerText = homeName;
      document.getElementById('bubble-subtitle').innerText = `自家產業 · ${homeTier.name}`;
      document.getElementById('bubble-badge').innerText = '🏡 自家居所';
      document.getElementById('bubble-decision-text').innerText = '進入自家宅邸：擴建居所、更換衣裝、坐收產業分紅！';
      document.getElementById('bubble-cost').innerText = `0 ${currency}`;
      document.getElementById('bubble-reward').innerText = `${this.state.accumulatedRent || 0} ${currency}待領`;
      document.getElementById('bubble-crit').innerText = `Lv.${this.state.homeLevel}`;

      if (confirmBtn) {
        confirmBtn.innerHTML = '<span class="text-xl">🏡</span><span>進入自家宅邸（點擊或按空白鍵）</span>';
        confirmBtn.className = 'flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-lg sm:text-xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer';
      }
    } else if (zone.isDockMinigame) {
      const dockLoc = this.models.MAP_LOCATIONS.find(l => l.id === 'loc_dock');
      const locTitle = dockLoc ? dockLoc.name : `${workAction}水岸`;
      document.getElementById('bubble-icon').innerText = (this.currentEraId === 'era_01_prehistory') ? '🛶' : '⚓';
      document.getElementById('bubble-loc-name').innerText = locTitle;
      document.getElementById('bubble-subtitle').innerText = `${workAction} · 現賺${currency}與秘笈`;
      document.getElementById('bubble-badge').innerText = `💪 ${workAction}`;
      document.getElementById('bubble-decision-text').innerText = `幫忙整理貨物打工，點選 3 箱物資，現賺 30 ${currency}並拿時代情報！`;
      document.getElementById('bubble-cost').innerText = `0 ${currency}`;
      document.getElementById('bubble-reward').innerText = `30 ${currency}+情報`;
      document.getElementById('bubble-crit').innerText = '100%';

      if (confirmBtn) {
        confirmBtn.innerHTML = `<span class="text-xl">${(this.currentEraId === 'era_01_prehistory') ? '🛶' : '⚓'}</span><span>開始${workAction}（點擊或按空白鍵）</span>`;
        confirmBtn.className = 'flex-1 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-black text-lg sm:text-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer';
      }
    } else if (zone.isSpacetimePortal) {
      document.getElementById('bubble-icon').innerText = zone.isUnlocked ? '🌌' : '🔒';
      document.getElementById('bubble-loc-name').innerText = '時空長河躍遷渡口';
      document.getElementById('bubble-subtitle').innerText = zone.isUnlocked ? `前往【${zone.nextEra.title}】` : `🔒 前方為【${zone.nextEra.title}】`;
      document.getElementById('bubble-badge').innerText = zone.isUnlocked ? '✨ 時代已破關' : '🔒 需通關當前時代';
      document.getElementById('bubble-decision-text').innerText = zone.isUnlocked 
        ? `時空光幕已啟動！點擊或直接往右踏入傳送陣，即刻穿越至【${zone.nextEra.year} ${zone.nextEra.title}】！` 
        : `尚未通關當前時代【${this.currentEra.title}】！完成當前時代歷史抉擇破關後，方可跨越此處時空界線！`;
      document.getElementById('bubble-cost').innerText = `0 ${currency}`;
      document.getElementById('bubble-reward').innerText = '跨越時空';
      document.getElementById('bubble-crit').innerText = '100%';

      if (confirmBtn) {
        if (zone.isUnlocked) {
          confirmBtn.innerHTML = '<span class="text-xl">🌌</span><span>跨越時空長河（點擊或按空白鍵）</span>';
          confirmBtn.className = 'flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white font-black text-lg sm:text-xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 animate-pulse cursor-pointer';
        } else {
          confirmBtn.innerHTML = `<span class="text-xl">🔒</span><span>尚未破關（需通關【${this.currentEra.title}】）</span>`;
          confirmBtn.className = 'flex-1 py-4 rounded-2xl bg-slate-800 text-slate-400 font-bold text-sm sm:text-base shadow flex items-center justify-center gap-2 cursor-not-allowed';
        }
      }
    } else if (zone.isPrevSpacetimePortal) {
      document.getElementById('bubble-icon').innerText = '🕰️';
      document.getElementById('bubble-loc-name').innerText = '時空回溯渡口';
      document.getElementById('bubble-subtitle').innerText = `返回【${zone.prevEra.title}】`;
      document.getElementById('bubble-badge').innerText = '🕰️ 時空回溯';
      document.getElementById('bubble-decision-text').innerText = `回到前一個歷史時代【${zone.prevEra.year} ${zone.prevEra.title}】重溫冒險！`;
      document.getElementById('bubble-cost').innerText = `0 ${currency}`;
      document.getElementById('bubble-reward').innerText = '回溯歷史';
      document.getElementById('bubble-crit').innerText = '100%';

      if (confirmBtn) {
        confirmBtn.innerHTML = '<span class="text-xl">🕰️</span><span>返回前一時代（點擊或按空白鍵）</span>';
        confirmBtn.className = 'flex-1 py-4 rounded-2xl bg-gradient-to-r from-slate-700 to-amber-700 hover:from-slate-600 hover:to-amber-600 text-amber-200 font-black text-base sm:text-lg shadow flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer';
      }
    } else {
      const opt = zone.option;
      const loc = zone.location;
      document.getElementById('bubble-icon').innerText = loc.icon;
      document.getElementById('bubble-loc-name').innerText = loc.name;
      document.getElementById('bubble-subtitle').innerText = loc.subTitle;
      document.getElementById('bubble-badge').innerText = opt.badge || '歷史抉擇';
      document.getElementById('bubble-decision-text').innerText = opt.text || opt.actionText;
      const cost = opt.baseCost || 0;
      const reward = opt.baseSilverReward !== undefined ? opt.baseSilverReward : (opt.baseReward || 0);
      document.getElementById('bubble-cost').innerText = `${cost} ${currency}`;
      document.getElementById('bubble-reward').innerText = `${reward} ${currency}`;
      document.getElementById('bubble-crit').innerText = `${Math.round(opt.criticalChance * 100)}%`;

      if (confirmBtn) {
        if (this.state.silver < cost) {
          const shortage = cost - this.state.silver;
          confirmBtn.innerHTML = `<span>⚠️</span><span>資財不足（尚缺 ${shortage} ${currency}）· 點此自動前往${workAction}</span>`;
          confirmBtn.className = 'flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-700 to-red-700 hover:from-amber-600 hover:to-red-600 text-amber-200 font-black text-base sm:text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 animate-pulse cursor-pointer';
        } else {
          let actionIcon = (opt && opt.actionIcon) || '🤝';
          let actionText = (opt && (opt.buttonText || opt.actionButtonText)) || '確認歷史決策';

          if (!opt.buttonText && !opt.actionButtonText) {
            if (opt.id === 'opt_guo_strike_oppression' || this.state.identityId === 'guo_huaiyi') {
              actionIcon = '⚔️';
              actionText = '反抗荷蘭人';
            } else if (this.state.roleType === 'bureaucrat' || loc.type === 'choice_voc_gov' || loc.id === 'loc_customs') {
              actionIcon = '🏛️';
              actionText = '裁定法規制度';
            } else if (this.state.roleType === 'pioneer' || loc.type === 'choice_tribal_market') {
              actionIcon = '🏹';
              actionText = '議決部族協約';
            } else if (loc.type === 'choice_culture') {
              actionIcon = '📢';
              actionText = '啟動文化宣講';
            }
          }

          confirmBtn.innerHTML = `<span class="text-xl">${actionIcon}</span><span>${actionText}（點擊或按空白鍵）</span>`;
          confirmBtn.className = 'flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg sm:text-xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer';
        }
      }
    }

    // 綁定點擊與觸控事件，確保點擊必生效
    if (confirmBtn) {
      const handleBtnClick = (e) => {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }
        this.executeCurrentZoneChoice();
      };
      confirmBtn.onclick = handleBtnClick;
      confirmBtn.ontouchend = handleBtnClick;
      confirmBtn.onpointerdown = (e) => e.stopPropagation();
    }

    bubble.classList.remove('hidden');
    // 高亮並動態調整普攻按鍵文字與圖標
    const btn = document.getElementById('btn-interact');
    if (btn) {
      btn.classList.add('pressed');
      const iconEl = btn.querySelector('.attack-icon');
      const labelEl = btn.querySelector('.attack-label');
      if (zone.isPlayerHome) {
        if (iconEl) iconEl.innerText = '🏡';
        if (labelEl) labelEl.innerText = '進入宅邸';
      } else if (zone.isDockMinigame) {
        if (iconEl) iconEl.innerText = (this.currentEraId === 'era_01_prehistory') ? '🛶' : '⚓';
        if (labelEl) labelEl.innerText = (this.currentEraId === 'era_01_prehistory') ? '工藝打工' : '理貨打工';
      } else if (zone.isSpacetimePortal) {
        if (iconEl) iconEl.innerText = zone.isUnlocked ? '🌌' : '🔒';
        if (labelEl) labelEl.innerText = zone.isUnlocked ? '跨越時空' : '時空界線';
      } else if (zone.isPrevSpacetimePortal) {
        if (iconEl) iconEl.innerText = '🕰️';
        if (labelEl) labelEl.innerText = '時空回溯';
      } else {
        const curOpt = zone.option;
        const loc = zone.location || {};
        if (curOpt && (curOpt.buttonText || curOpt.actionButtonText)) {
          if (iconEl) iconEl.innerText = curOpt.actionIcon || '⚔️';
          if (labelEl) labelEl.innerText = curOpt.buttonText || curOpt.actionButtonText;
        } else if (curOpt && (curOpt.id === 'opt_guo_strike_oppression' || this.state.identityId === 'guo_huaiyi')) {
          if (iconEl) iconEl.innerText = '⚔️';
          if (labelEl) labelEl.innerText = '反抗荷蘭';
        } else if (this.state.roleType === 'bureaucrat' || loc.type === 'choice_voc_gov' || loc.id === 'loc_customs') {
          if (iconEl) iconEl.innerText = '🏛️';
          if (labelEl) labelEl.innerText = '裁定法規';
        } else if (this.state.roleType === 'pioneer' || loc.type === 'choice_tribal_market') {
          if (iconEl) iconEl.innerText = '🏹';
          if (labelEl) labelEl.innerText = '議決盟約';
        } else if (loc.type === 'choice_culture') {
          if (iconEl) iconEl.innerText = '📢';
          if (labelEl) labelEl.innerText = '文化宣講';
        } else {
          if (iconEl) iconEl.innerText = '🤝';
          if (labelEl) labelEl.innerText = '交涉商號';
        }
      }
    }
  }

  hideZonePromptBubble() {
    this.currentZoneKey = null;
    const bubble = document.getElementById('zone-prompt-bubble');
    if (bubble) bubble.classList.add('hidden');
    const btn = document.getElementById('btn-interact');
    if (btn) {
      btn.classList.remove('pressed');
      const iconEl = btn.querySelector('.attack-icon');
      const labelEl = btn.querySelector('.attack-label');
      if (this.state.roleType === 'bureaucrat') {
        if (iconEl) iconEl.innerText = '🏛️';
        if (labelEl) labelEl.innerText = '政務裁決';
      } else if (this.state.roleType === 'pioneer') {
        if (iconEl) iconEl.innerText = '🏹';
        if (labelEl) labelEl.innerText = '時代先鋒';
      } else {
        if (iconEl) iconEl.innerText = '🤝';
        if (labelEl) labelEl.innerText = '交涉商號';
      }
    }
  }

  executeCurrentZoneChoice() {
    if (!this.currentContactZone) return;
    if (window.soundFx) window.soundFx.playClick();

    if (this.currentContactZone.isPlayerHome) {
      this.showHomeModal();
      return;
    }

    if (this.currentContactZone.isDockMinigame) {
      this.startDockMinigame();
      return;
    }

    if (this.currentContactZone.isSpacetimePortal) {
      const zone = this.currentContactZone;
      if (zone.isUnlocked) {
        this.jumpToNextEraSpacetime(zone.nextEra.id);
      } else {
        if (window.soundFx) window.soundFx.playClick();
        this.showToast(`🔒 時代篇章【${zone.nextEra.title}】尚未解鎖！需先通關當前【${this.currentEra.title}】全部角色！`, 3500);
      }
      return;
    }

    if (this.currentContactZone.isPrevSpacetimePortal) {
      const zone = this.currentContactZone;
      this.jumpToPrevEraSpacetime(zone.prevEra.id);
      return;
    }

    const opt = this.currentContactZone.option;
    if (opt && this.state.silver < opt.baseCost) {
      const shortage = opt.baseCost - this.state.silver;
      this.showToast(`⚠️ 本金不足！尚缺 ${shortage} 兩，已為您自動導航至碼頭打工`);
      this.autoNavigateToLocation('loc_dock');
      this.hideZonePromptBubble();
      return;
    }

    this.chooseOption(this.currentContactZone.optionIndex);
  }

  handlePrimaryAction() {
    // 彈窗或戰報卡開啟期間，優先響應彈窗的主確認/關閉操作，絕不誤觸地面選項
    if (this.isAnyModalOpen()) {
      const examModal = document.getElementById('exam-review-modal');
      if (examModal) {
        const closeBtn = document.getElementById('btn-close-exam-review');
        if (closeBtn) {
          closeBtn.click();
          return;
        }
      }
      const consModal = document.getElementById('consequence-modal');
      if (consModal && !consModal.classList.contains('hidden')) {
        const nextBtn = document.getElementById('cons-next-btn');
        if (nextBtn) {
          nextBtn.click();
          return;
        }
      }
      return;
    }

    if (this.currentContactZone) {
      this.executeCurrentZoneChoice();
    } else {
      // 若沒在圈內，施放普攻交涉動畫揮擊
      if (window.soundFx) window.soundFx.playClick();
      this.hero.walkFrame += 1;
      this.addFloatingText(this.hero.x, this.hero.y - 40, '請走至目標商行法陣！', '#93c5fd');
    }
  }

  // ======================== 戰場 2.5D Canvas 繪製 ========================
  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // 清空高清畫布實體像素緩衝區
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 應用 Retina DPR 縮放與相機位移 (全部以 CSS 像素坐標進行繪製)
    ctx.scale(this.dpr, this.dpr);
    ctx.translate(-this.camera.x, -this.camera.y);

    // 1. 繪製大地圖歷史景觀 (泉州石板大道、淡水河道、戎克帆船、碼頭棧橋、老榕樹)
    this.drawTerrain(ctx);

    // 2. 繪製環境微風粒子 (茶葉微粒、燈火光點、水域海鷗)
    this.drawAmbientParticles(ctx);

    // 3. 繪製點擊自動尋路目標光標 (Nav Target Ripple)
    this.drawNavTarget(ctx);

    // 4. 繪製導引雷達金色路徑
    this.drawRadarPath(ctx);

    // 5. 繪製歷史商行地標建築、門額牌匾與懸浮任務標籤
    this.drawLocations(ctx);

    // 6. 繪製大稻埕市井群像 NPC (挑茶苦力、洋商陶德、買辦、巡勇、學徒)
    this.drawNPCs(ctx);

    // 7. 繪製英雄殘影 (衝刺特效)
    this.drawGhostTrails(ctx);

    // 8. 繪製主角清代長辮、邁步動態、階層服飾躍遷與頭頂狀態卡
    this.drawHero(ctx);

    // 9. 繪製任務導引金色羅盤指針 (Quest Compass Navigation Needle)
    this.drawQuestCompassNeedle(ctx);

    // 10. 繪製戰場浮動跳字
    this.drawFloatingTexts(ctx);

    ctx.restore();
  }

  // 1. 繪製大地圖地景與時代水文 (Terrain & Historical Atmosphere)
  drawTerrain(ctx) {
    // 基底土地顏色 (擴展覆蓋四方緩衝區，確保相機往上、往左平移時不露黑邊)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-1400, -600, this.worldWidth + 2400, this.worldHeight + 1200);

    // 鋪設細緻微石磚地紋 (止於淡水河岸線 y: 750)
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
    ctx.lineWidth = 1;
    const tSize = 48;
    for (let x = -1200; x < this.worldWidth + 600; x += tSize) {
      ctx.beginPath();
      ctx.moveTo(x, -600);
      ctx.lineTo(x, 750);
      ctx.stroke();
    }
    for (let y = -600; y < 750; y += tSize) {
      ctx.beginPath();
      ctx.moveTo(-1200, y);
      ctx.lineTo(this.worldWidth + 600, y);
      ctx.stroke();
    }

    // 街道沿線八角宮廷石雕風燈 (溫潤暖光輻射光暈，寬闊分佈)
    this.drawStreetLanternPost(ctx, 450, 220);
    this.drawStreetLanternPost(ctx, 950, 220);
    this.drawStreetLanternPost(ctx, 450, 580);
    this.drawStreetLanternPost(ctx, 950, 580);

    // 繪製泉州花崗石板大道 (寬敞大路，南北與東西延伸至各建築門前)
    this.drawStonePath(ctx, 700, 80, 700, 710); // 南北大街 (貫穿商邸、廣場與碼頭)
    this.drawStonePath(ctx, 160, 220, 1140, 220); // 北部橫向大道 (貫通東西商郊與洋行)
    this.drawStonePath(ctx, 260, 220, 700, 420);  // 西北斜向大道 (金聯成通向廣場)
    this.drawStonePath(ctx, 1140, 220, 700, 420); // 東北斜向大道 (寶順洋行通向廣場)
    this.drawStonePath(ctx, 700, 420, 1140, 580); // 東南斜向大道 (通往淡水海關)
    this.drawDirtPath(ctx, 700, 420, 260, 580);  // 西南暗巷泥徑 (通往𧶄瑯私渡口)

    // 東方長河星軌大道 (貫穿至東方時空渡口，寬闊遊樂場通道)
    this.drawStonePath(ctx, 700, 420, 2320, 420);
    // 西方時空回溯星軌大道 (自中央廣場一路向西直達西方渡口 -750，遠離城鎮工棚)
    this.drawStonePath(ctx, 700, 420, -750, 420);

    // 繪製東方遊樂場大道與景觀公園
    this.drawPlaygroundBoulevard(ctx);

    // 中央開市青石廣場 (石龍祥雲紋鋪面，移至 700, 420 開闊中心)
    ctx.save();
    ctx.beginPath();
    ctx.arc(700, 420, 105, 0, Math.PI * 2);
    ctx.fillStyle = '#192338';
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 廣場內圈花崗岩石環
    ctx.beginPath();
    ctx.arc(700, 420, 78, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.setLineDash([10, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 廣場中央吉祥如意回紋印記
    ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
    ctx.beginPath();
    ctx.arc(700, 420, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 廣場四角石雕風燈
    const angles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
    for (const ang of angles) {
      const lx = 700 + Math.cos(ang) * 95;
      const ly = 420 + Math.sin(ang) * 95;
      const radGrad = ctx.createRadialGradient(lx, ly, 2, lx, ly, 32);
      radGrad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
      radGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(lx, ly, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.fillRect(lx - 7, ly - 7, 14, 14);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(lx - 4, ly - 4, 8, 8);
    }
    ctx.restore();

    // ================== 淡水河水文與港灣水景 (擴展至地圖底部 750~900) ==================
    const riverStartY = 750;
    const waterGrad = ctx.createLinearGradient(0, riverStartY, 0, this.worldHeight + 400);
    waterGrad.addColorStop(0, '#0c2844');
    waterGrad.addColorStop(0.2, '#075985');
    waterGrad.addColorStop(0.65, '#0369a1');
    waterGrad.addColorStop(1, '#0284c7');

    ctx.fillStyle = waterGrad;
    ctx.fillRect(-1400, riverStartY, this.worldWidth + 2400, this.worldHeight - riverStartY + 600);

    // 河岸石砌防潮坡堤
    ctx.fillStyle = '#334155';
    ctx.fillRect(-1400, riverStartY - 8, this.worldWidth + 2400, 10);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-1400, riverStartY - 8, this.worldWidth + 2400, 10);

    // 水波粼粼波紋
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.28)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const wy = riverStartY + 20 + i * 26;
      const waveShift = Math.sin(this.ambientLightTick * 1.5 + i * 0.8) * 35;
      ctx.beginPath();
      ctx.moveTo(-1400, wy);
      ctx.bezierCurveTo(380 + waveShift, wy - 12, 750 - waveShift, wy + 12, 1100 + waveShift, wy - 6);
      ctx.lineTo(this.worldWidth + 800, wy);
      ctx.stroke();
    }

    if (this.currentEraId === 'era_01_prehistory') {
      // 停泊的史前竹筏與外洋獨木舟
      this.drawBambooRaft(ctx, 350, 830);
      this.drawOutriggerCanoe(ctx, 1050, 830);
    } else {
      // 停泊的清代戎克帆船
      this.drawChineseJunk(ctx, 350, 830);
      // 停泊的開港外商三桅輪船
      this.drawWesternShip(ctx, 1050, 830);
    }

    // 碼頭大木棧橋
    this.drawDockPier(ctx);

    // 遮陰老榕樹
    this.drawBanyanTree(ctx, 420, 290, 48);
    this.drawBanyanTree(ctx, 980, 290, 50);

    if (this.currentEraId === 'era_01_prehistory') {
      // 史前玉石打磨區與聚落陶器
      this.drawPrehistoricCraftZone(ctx, 1050, 290);
      this.drawPrehistoricCraftZone(ctx, 1050, 330);
      this.drawPrehistoricHutStall(ctx, 520, 370);
      this.drawPrehistoricHutStall(ctx, 880, 370);
    } else {
      // 街邊曬茶竹篩 (Outside 寶順洋行)
      this.drawTeaTrays(ctx, 1050, 290);
      this.drawTeaTrays(ctx, 1050, 330);

      // 市井生活場景 (奉茶棚、南北貨攤、運茶推車、茉莉陶盆)
      this.drawTeaStall(ctx, 520, 370);
      this.drawGoodsStall(ctx, 880, 370);
      this.drawPushcart(ctx, 600, 470);
      this.drawJasminePot(ctx, 580, 320);
      this.drawJasminePot(ctx, 820, 320);
      this.drawJasminePot(ctx, 580, 490);
      this.drawJasminePot(ctx, 820, 490);
    }
  }

    // 繪製泉州花崗石板路
  drawStonePath(ctx, x1, y1, x2, y2) {
    ctx.save();
    ctx.strokeStyle = '#273549';
    ctx.lineWidth = 36;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // 內側亮色青石芯
    ctx.strokeStyle = '#33445c';
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // 石縫分節線
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([12, 14]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 繪製私渡口泥濘小徑
  drawDirtPath(ctx, x1, y1, x2, y2) {
    ctx.save();
    ctx.strokeStyle = '#2d221c';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = '#3e2e26';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  // 繪製淡水河清代戎克帆船 (Chinese Junk)
  drawChineseJunk(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // 船身倒影
    ctx.fillStyle = 'rgba(5, 30, 50, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 65, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // 船體木造弧形 (深柚木色)
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(-60, -8);
    ctx.bezierCurveTo(-45, 18, 45, 18, 65, -10);
    ctx.lineTo(50, -18);
    ctx.bezierCurveTo(20, -14, -40, -14, -60, -8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 船頭紅漆彩繪與「龍目」(船眼，祈求順風看路)
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-58, -12, 16, 8);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-50, -8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-49, -8, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 兩根木檣 (Main & Foremast)
    ctx.strokeStyle = '#522b10';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-15, -12);
    ctx.lineTo(-15, -60);
    ctx.moveTo(25, -12);
    ctx.lineTo(25, -50);
    ctx.stroke();

    // 竹骨橫桁布帆 (Battened Sail)
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(-15, -58);
    ctx.quadraticCurveTo(-38, -40, -15, -20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    // 橫桁骨
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-15, -50 + i * 8);
      ctx.lineTo(-30 + i * 2, -44 + i * 8);
      ctx.stroke();
    }

    // 船尾紅旗
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(52, -18);
    ctx.lineTo(64, -22);
    ctx.lineTo(52, -26);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // 繪製開港三桅洋船 (Western Treaty Port Vessel)
  drawWesternShip(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // 水中陰影
    ctx.fillStyle = 'rgba(5, 30, 50, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 20, 85, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // 黑色鐵木船殼
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-80, -6);
    ctx.bezierCurveTo(-50, 22, 60, 22, 85, -8);
    ctx.lineTo(75, -20);
    ctx.lineTo(-70, -16);
    ctx.closePath();
    ctx.fill();

    // 白舷條紋 (Victorian Gunport Stripe)
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-72, 0);
    ctx.bezierCurveTo(-45, 12, 55, 12, 78, 0);
    ctx.stroke();

    // 三根高聳主檣
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    const masts = [-35, 5, 45];
    for (const mx of masts) {
      ctx.beginPath();
      ctx.moveTo(mx, -15);
      ctx.lineTo(mx, -65);
      ctx.stroke();
      // 橫桁
      ctx.beginPath();
      ctx.moveTo(mx - 14, -45);
      ctx.lineTo(mx + 14, -45);
      ctx.stroke();
    }

    // 蒸汽煙囪微煙
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-12, -32, 7, 18);
    ctx.fillStyle = 'rgba(241, 245, 249, 0.4)';
    ctx.beginPath();
    ctx.arc(-8, -38, 4, 0, Math.PI * 2);
    ctx.fill();

    // 英國商船紅旗 (Red Ensign)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(72, -32, 14, 9);

    ctx.restore();
  }

  // 繪製碼頭大木棧橋 (Dock Boardwalk & Tea Cargo Props)
  drawDockPier(ctx) {
    const px = 605;
    const py = 720;
    const pw = 190;
    const ph = 140;

    // 木棧橋主板
    ctx.fillStyle = '#451a03';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#290f01';
    ctx.lineWidth = 3;
    ctx.strokeRect(px, py, pw, ph);

    // 橫向木條板紋
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    for (let y = py + 12; y < py + ph; y += 14) {
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(px + pw, y);
      ctx.stroke();
    }

    // 棧道兩側繫纜樁 (Mooring Bollards)
    const bollards = [
      { x: px + 10, y: py + 25 },
      { x: px + 10, y: py + 75 },
      { x: px + 10, y: py + 125 },
      { x: px + pw - 10, y: py + 25 },
      { x: px + pw - 10, y: py + 75 },
      { x: px + pw - 10, y: py + 125 }
    ];
    for (const b of bollards) {
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 堆疊的出口茶箱 (印有 Formosa Oolong Tea)
    this.drawCargoBox(ctx, px + 22, py + 30, 'TEA');
    this.drawCargoBox(ctx, px + 44, py + 30, 'TEA');
    this.drawCargoBox(ctx, px + 33, py + 15, 'TEA');

    // 樟腦與砂糖木桶
    this.drawCargoBarrel(ctx, px + pw - 42, py + 30);
    this.drawCargoBarrel(ctx, px + pw - 24, py + 34);

    // 鐵錨與粗麻纜繩
    ctx.fillStyle = '#64748b';
    ctx.font = '22px sans-serif';
    ctx.fillText('⚓', px + pw - 35, py + 100);
  }

  // 奉茶水棚 (Roadside Complimentary Tea Stall)
  drawTeaStall(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // 地面小陰影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(-22, 10, 44, 8);

    // 兩根竹木支柱
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-18, 12);
    ctx.lineTo(-18, -14);
    ctx.moveTo(18, 12);
    ctx.lineTo(18, -14);
    ctx.stroke();

    // 藍白條紋遮陽布棚 (Awning)
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.moveTo(-24, -14);
    ctx.lineTo(24, -14);
    ctx.lineTo(20, -22);
    ctx.lineTo(-20, -22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 「奉茶」茶幌小布幡
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-10, -12, 20, 10);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 7px "Noto Serif TC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('奉茶', 0, -4.5);

    // 長木茶桌
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-16, 2, 32, 8);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1;
    ctx.strokeRect(-16, 2, 32, 8);

    // 宜興大茶壺與白瓷碗
    ctx.fillStyle = '#7c2d12'; // 紫砂大壺
    ctx.beginPath();
    ctx.arc(-6, 1, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff'; // 茶碗
    ctx.beginPath();
    ctx.arc(4, 3, 2, 0, Math.PI * 2);
    ctx.arc(10, 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // 裊裊茶香熱氣微蒸
    const steamY = Math.sin(this.ambientLightTick * 3) * 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6, -2);
    ctx.quadraticCurveTo(-8, -6 + steamY, -5, -9 + steamY);
    ctx.stroke();

    ctx.restore();
  }

  // 南北貨藥材攤 (Dried Goods & Herbal Stand)
  drawGoodsStall(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // 陰影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(-22, 10, 44, 8);

    // 遮雨油布棚
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(-22, -14);
    ctx.lineTo(22, -14);
    ctx.lineTo(18, -22);
    ctx.lineTo(-18, -22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 木條支架
    ctx.strokeStyle = '#522b10';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, 12);
    ctx.lineTo(-16, -14);
    ctx.moveTo(16, 12);
    ctx.lineTo(16, -14);
    ctx.stroke();

    // 展示攤台
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-18, 2, 36, 9);

    // 竹籮筐裝著紅棗、當歸與樟腦
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.arc(-8, 3, 4, 0, Math.PI * 2); // 竹筐1
    ctx.arc(2, 3, 4, 0, Math.PI * 2);  // 竹筐2
    ctx.fill();

    // 紅棗(紅)、藥材(黑)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(-8, 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(2, 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 招牌「南北貨」
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-12, -12, 24, 9);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 6.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('南北貨', 0, -5.5);

    ctx.restore();
  }

  // 運茶木板二輪推車 (Wooden Handcart with Tea Sacks)
  drawPushcart(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // 陰影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(-18, 6, 36, 6);

    // 兩個木輪
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(-10, 6, 5.5, 0, Math.PI * 2);
    ctx.arc(10, 6, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 推車木板架
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-16, -2, 32, 7);
    ctx.strokeStyle = '#290f01';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-16, -2, 32, 7);

    // 推車把手
    ctx.strokeStyle = '#522b10';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(24, -4);
    ctx.stroke();

    // 堆疊的麻布袋 (茶 / 糖)
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.roundRect(-12, -9, 13, 8, 2);
    ctx.roundRect(0, -9, 13, 8, 2);
    ctx.roundRect(-6, -15, 12, 7, 2);
    ctx.fill();

    // 墨印「茶」與「糖」
    ctx.fillStyle = '#451a03';
    ctx.font = 'bold 6px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('茶', -6, -3.5);
    ctx.fillText('糖', 6, -3.5);

    ctx.restore();
  }

  // 大稻埕茉莉花陶盆 (Potted Jasmine for Scented Tea)
  drawJasminePot(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // 紅陶花盆
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.moveTo(-6, 6);
    ctx.lineTo(6, 6);
    ctx.lineTo(8, -1);
    ctx.lineTo(-8, -1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 茂盛翠綠茉莉枝葉
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(0, -6, 8, 0, Math.PI * 2);
    ctx.fill();

    // 盛開的白色茉莉花朵 (Jasmine blossoms)
    ctx.fillStyle = '#ffffff';
    const petals = [
      { x: -3, y: -8 },
      { x: 3, y: -7 },
      { x: 0, y: -4 },
      { x: -4, y: -4 }
    ];
    for (const p of petals) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
    }

    ctx.restore();
  }

  // 街角八角宮廷石雕風燈 (Street Lantern Post with soft breathing glow)
  drawStreetLanternPost(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // 柔和溫暖光暈 (Ambient Light Glow)
    const flicker = Math.sin(this.ambientLightTick * 2.5 + x) * 4;
    const rad = ctx.createRadialGradient(0, -6, 4, 0, -6, 52 + flicker);
    rad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    rad.addColorStop(0.4, 'rgba(245, 158, 11, 0.15)');
    rad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = rad;
    ctx.beginPath();
    ctx.arc(0, -6, 52 + flicker, 0, Math.PI * 2);
    ctx.fill();

    // 青石燈柱基座
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-6, 16, 12, 6);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-2.5, 0, 5, 18);

    // 銅漆八角風燈座
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(7, 0);
    ctx.lineTo(9, -12);
    ctx.lineTo(-9, -12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 燈芯暖火
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, -6, 4, 0, Math.PI * 2);
    ctx.fill();

    // 飛簷尖頂
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(-11, -12);
    ctx.lineTo(11, -12);
    ctx.lineTo(0, -20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // 繪製出口木茶箱
  drawCargoBox(ctx, x, y, label) {
    ctx.save();
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x, y, 20, 16);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, 20, 16);
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 6.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + 10, y + 10.5);
    ctx.restore();
  }

  // 繪製樟腦木桶
  drawCargoBarrel(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(x, y, 16, 20, 3);
    ctx.fill();
    ctx.strokeStyle = '#334155'; // 鐵箍
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, 16, 20);
    ctx.beginPath();
    ctx.moveTo(x, y + 7);
    ctx.lineTo(x + 16, y + 7);
    ctx.moveTo(x, y + 13);
    ctx.lineTo(x + 16, y + 13);
    ctx.stroke();
    ctx.restore();
  }

  // 繪製百年老榕樹 (Banyan Tree with Aerial Roots)
  drawBanyanTree(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);

    // 地面大樹遮蔭
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 8, r * 1.15, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 盤根錯節老樹幹
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // 飄垂氣根 (Aerial Roots)
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    for (let i = -12; i <= 12; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + (i % 4), 16);
      ctx.stroke();
    }

    // 茂盛深綠樹冠 (多層次圓弧重疊)
    const crownColors = ['#14532d', '#166534', '#15803d', '#22c55e'];
    for (let i = 0; i < crownColors.length; i++) {
      ctx.fillStyle = crownColors[i];
      const cr = r - i * 8;
      const offX = Math.sin(i * 1.8) * 6;
      const offY = -i * 5;
      ctx.beginPath();
      ctx.arc(offX, offY, cr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 繪製曬茶竹篩 (Woven Bamboo Winnowing Trays with Tea Leaves)
  drawTeaTrays(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    // 竹編盤
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 盤內鮮翠茶青 (Green Tea Leaves)
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 繪製史前竹筏 (Prehistoric Bamboo Raft)
  drawBambooRaft(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(5, 30, 50, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 55, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = -4; i <= 4; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#65a30d' : '#84cc16';
      ctx.beginPath();
      ctx.roundRect(-48, i * 4.5, 96, 4, 2);
      ctx.fill();
      ctx.strokeStyle = '#365314';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-30, -20); ctx.lineTo(-30, 20);
    ctx.moveTo(0, -20); ctx.lineTo(0, 20);
    ctx.moveTo(30, -20); ctx.lineTo(30, 20);
    ctx.stroke();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-15, -25); ctx.lineTo(25, 25);
    ctx.stroke();
    ctx.restore();
  }

  // 繪製史前南島外洋獨木舟 (Prehistoric Outrigger Canoe)
  drawOutriggerCanoe(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(0, 0, 55, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(-55, 0); ctx.lineTo(-66, -9); ctx.lineTo(-48, 2); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(55, 0); ctx.lineTo(66, -9); ctx.lineTo(48, 2); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-22, 10); ctx.lineTo(-22, 28);
    ctx.moveTo(22, 10); ctx.lineTo(22, 28);
    ctx.stroke();
    ctx.fillStyle = '#854d0e';
    ctx.beginPath();
    ctx.ellipse(0, 29, 45, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 繪製史前玉石打磨區與石砧 (Prehistoric Jade Grinding Slab)
  drawPrehistoricCraftZone(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 溫潤閃玉玦原胚
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(-4, -2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  // 繪製史前茅草部落棚架與陶罐 (Prehistoric Tribal Thatched Stall)
  drawPrehistoricHutStall(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    // 木樁柱
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, 15); ctx.lineTo(-18, -12);
    ctx.moveTo(18, 15); ctx.lineTo(18, -12);
    ctx.stroke();
    // 茅草頂棚
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(24, -10);
    ctx.lineTo(-24, -10);
    ctx.closePath();
    ctx.fill();
    // 紅陶罐
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.arc(-6, 8, 7, 0, Math.PI * 2);
    ctx.arc(8, 9, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 2. 繪製環境飄浮粒子 (Tea Leaves, Sparks & Seagulls)
  drawAmbientParticles(ctx) {
    // 飄落茶葉與燈花 / 玉石微粒
    for (const p of this.ambientParticles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      if (p.type === 'tealeaf') {
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'jadespark') {
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 翱翔水域海鷗
    for (const sg of this.seagulls) {
      ctx.save();
      ctx.translate(sg.x, sg.y);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.8;
      const wingFlap = Math.sin(sg.wing) * 6;
      ctx.beginPath();
      ctx.moveTo(-10, wingFlap);
      ctx.quadraticCurveTo(-5, -4, 0, 0);
      ctx.quadraticCurveTo(5, -4, 10, wingFlap);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 3. 繪製地標特色建築、門額木匾與任務標籤 (專門分層，徹底解決文字重疊)
  drawLocations(ctx) {
    const currentNode = this.models.EVENT_NODES[this.state.currentNodeId];

    for (const loc of this.models.MAP_LOCATIONS) {
      const opt = currentNode ? currentNode.options.find(o => o.targetLocationId === loc.id) : null;
      const isTarget = !!opt || loc.id === 'loc_dock';

      ctx.save();

      // 1. 地面發光法陣 (Ground Interactivity Circle) - 保持正常地標色彩，絕不劇透首選
      const ringColor = opt ? (loc.themeColor || '#38bdf8') : (loc.id === 'loc_dock' ? '#0284c7' : '#64748b');
      const pulse = Math.sin(this.ambientLightTick * 2.5) * 3;

      ctx.beginPath();
      ctx.arc(loc.doorX, loc.doorY, 40 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = opt ? 'rgba(56, 189, 248, 0.12)' : 'rgba(100, 116, 139, 0.08)';
      ctx.fill();
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = opt ? 2.5 : 1.5;
      ctx.stroke();

      // 內圈八卦/商行刻度
      ctx.beginPath();
      ctx.arc(loc.doorX, loc.doorY, 24, 0, Math.PI * 2);
      ctx.strokeStyle = ringColor;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. 特色時代立體建築本體繪製 (依據當前年代動態切換)
      if (loc.id === 'loc_player_home') {
        if (this.currentEraId === 'era_01_prehistory') {
          this.drawBuildingPrehistoricHome(ctx, loc, ringColor);
        } else {
          this.drawBuildingPlayerHome(ctx, loc, ringColor);
        }
      } else if (loc.id === 'loc_sugar_guild') {
        if (this.currentEraId === 'era_01_prehistory') {
          this.drawBuildingPrehistoricJadeWorkshop(ctx, loc, ringColor);
        } else {
          this.drawBuildingFujianGuild(ctx, loc, ringColor);
        }
      } else if (loc.id === 'loc_tea_firm') {
        if (this.currentEraId === 'era_01_prehistory') {
          this.drawBuildingPrehistoricIronSmelter(ctx, loc, ringColor);
        } else {
          this.drawBuildingWesternArcade(ctx, loc, ringColor);
        }
      } else if (loc.id === 'loc_customs') {
        if (this.currentEraId === 'era_01_prehistory') {
          this.drawBuildingPrehistoricCaveMegalith(ctx, loc, ringColor);
        } else {
          this.drawBuildingCustomsGate(ctx, loc, ringColor);
        }
      } else if (loc.id === 'loc_dock') {
        if (this.currentEraId === 'era_01_prehistory') {
          this.drawBuildingPrehistoricRaftLanding(ctx, loc, ringColor);
        } else {
          this.drawBuildingDockWarehouse(ctx, loc, ringColor);
        }
      } else {
        if (this.currentEraId === 'era_01_prehistory') {
          this.drawBuildingPrehistoricOutriggerCamp(ctx, loc, ringColor);
        } else {
          this.drawBuildingSmugglerShack(ctx, loc, ringColor);
        }
      }

      // 3. 【古風門額木匾】(商號/聚落地標名稱，字體放大清晰醒目)
      const plaqueY = loc.y - 24;
      const plaqueW = 208;
      const plaqueH = 34;

      ctx.fillStyle = '#1c0f08'; // 仿紅木黑漆
      ctx.strokeStyle = loc.id === 'loc_player_home' ? '#4ade80' : '#ca8a04'; // 鎏金包邊
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(loc.x + loc.width / 2 - plaqueW / 2, plaqueY, plaqueW, plaqueH, 7);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = loc.id === 'loc_player_home' ? '#86efac' : '#fef08a';
      ctx.font = 'bold 18px "Noto Serif TC", "Songti TC", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 5;
      ctx.fillText(loc.banner, loc.x + loc.width / 2, plaqueY + plaqueH / 2);
      ctx.shadowBlur = 0;

      // 4. 【常駐功能地標標籤】依需求：僅有行腳理貨/碼頭與自家私宅顯示常駐提示；歷史任務/決策建築絕不浮現選項標籤，不給任何劇透暗示
      if (loc.id === 'loc_dock' || loc.id === 'loc_player_home') {
        const floatY = loc.y - 66 + Math.sin(this.ambientLightTick * 3 + loc.doorX) * 3;
        const badgeW = 216;
        const badgeH = 32;

        const workName = (this.currentEra && this.currentEra.workActionName) || '打工理貨';
        const homeName = (this.currentEra && this.currentEra.homeName) || '居所宅邸';

        let badgeBg = 'rgba(2, 132, 199, 0.95)';
        let badgeBorder = '#7dd3fc';
        let badgeText = `🛶 ${workName} · 探聽情報`;
        let badgeTextColor = '#ffffff';

        if (loc.id === 'loc_player_home') {
          badgeBg = 'rgba(15, 60, 35, 0.96)';
          badgeBorder = '#4ade80';
          badgeText = `🛖 ${homeName} · Lv.${this.state.homeLevel || 1}`;
          badgeTextColor = '#fef08a';
        }

        ctx.fillStyle = badgeBg;
        ctx.strokeStyle = badgeBorder;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.roundRect(loc.x + loc.width / 2 - badgeW / 2, floatY, badgeW, badgeH, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = badgeTextColor;
        ctx.font = 'bold 15px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, loc.x + loc.width / 2, floatY + badgeH / 2);
      }

      ctx.restore();
    }
  }

  // 建築 0：🏡 大稻埕 · 承恩商邸 (玩家自家私宅，隨等級進階4段蛻變)
  drawBuildingPlayerHome(ctx, loc, ringColor) {
    const x = loc.x;
    const y = loc.y;
    const w = loc.width;
    const h = loc.height;
    const lvl = this.state ? this.state.homeLevel : 1;

    if (lvl === 1) {
      // 1 階：臨河竹籬小茅舍 (Bamboo Thatched Cottage)
      ctx.fillStyle = '#451a03'; // 木造地基
      ctx.fillRect(x + 10, y + h - 14, w - 20, 14);

      // 竹編外牆
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + 15, y + 36, w - 30, h - 50);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      for (let bx = x + 25; bx < x + w - 25; bx += 10) {
        ctx.beginPath();
        ctx.moveTo(bx, y + 36);
        ctx.lineTo(bx, y + h - 14);
        ctx.stroke();
      }

      // 金黃茅草屋頂坡面
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + 10);
      ctx.lineTo(x + w + 5, y + 42);
      ctx.lineTo(x - 5, y + 42);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 小木柴門
      ctx.fillStyle = '#291205';
      ctx.fillRect(loc.doorX - 18, y + h - 42, 36, 42);
      ctx.strokeStyle = '#78350f';
      ctx.strokeRect(loc.doorX - 18, y + h - 42, 36, 42);

      // 門旁曬茶竹竿
      ctx.strokeStyle = '#84cc16';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 25);
      ctx.lineTo(x + 8, y + h - 5);
      ctx.stroke();
      // 小綠籬笆
      ctx.fillStyle = '#15803d';
      for (let fx = x - 8; fx < x + 18; fx += 8) {
        ctx.fillRect(fx, y + h - 25, 4, 25);
      }

    } else if (lvl === 2) {
      // 2 階：貴德街紅磚燕尾瓦厝 (Red-brick House with swallowtail roof)
      ctx.fillStyle = '#334155'; // 花崗石台基
      ctx.fillRect(x + 5, y + h - 16, w - 10, 16);

      // 閩南紅磚立面
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(x + 10, y + 34, w - 20, h - 50);
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1.2;
      for (let by = y + 44; by < y + h - 20; by += 12) {
        ctx.beginPath(); ctx.moveTo(x + 10, by); ctx.lineTo(x + w - 10, by); ctx.stroke();
      }

      // 燕尾翹脊青黑筒瓦屋頂
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(x - 12, y + 20); // 燕尾微翹
      ctx.quadraticCurveTo(x + w / 2, y + 12, x + w + 12, y + 20);
      ctx.lineTo(x + w + 4, y + 40);
      ctx.lineTo(x - 4, y + 40);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 門前雙紅燈籠
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(x + 24, y + 48, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + w - 24, y + 48, 7, 0, Math.PI * 2); ctx.fill();

      // 正門
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(loc.doorX - 20, y + h - 44, 40, 44);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(loc.doorX - 20, y + h - 44, 40, 44);

    } else if (lvl === 3) {
      // 3 階：閩南雕花雙進大宅院 (Mansion Courtyard)
      ctx.fillStyle = '#1e293b'; // 條石地基
      ctx.fillRect(x, y + h - 18, w, 18);

      // 左右雙廂房與正廳
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(x + 8, y + 30, w - 16, h - 48);

      // 兩側護龍屋脊
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 4, y + 24, 28, 14);
      ctx.fillRect(x + w - 32, y + 24, 28, 14);

      // 正廳重檐青綠琉璃瓦頂
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.moveTo(x - 14, y + 15);
      ctx.quadraticCurveTo(x + w / 2, y + 5, x + w + 14, y + 15);
      ctx.lineTo(x + w + 4, y + 36);
      ctx.lineTo(x - 4, y + 36);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 門前一對青石抱鼓石
      ctx.fillStyle = '#64748b';
      ctx.beginPath(); ctx.arc(loc.doorX - 25, y + h - 12, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(loc.doorX + 25, y + h - 12, 6, 0, Math.PI * 2); ctx.fill();

      // 朱紅金釘厚門
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(loc.doorX - 22, y + h - 48, 44, 48);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(loc.doorX - 22, y + h - 48, 44, 48);

    } else {
      // 4 階：巴洛克西洋鐘樓商號豪邸 (Baroque Clock Tower Palace)
      // 典雅西洋花崗石基座
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x - 4, y + h - 20, w + 8, 20);

      // 三層巴洛克洋樓紅磚拱圈外立面
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(x + 4, y + 20, w - 8, h - 40);

      // 多立克式西洋白色圓柱拱廊
      ctx.fillStyle = '#f8fafc';
      ctx.lineWidth = 2;
      for (let cx = x + 16; cx < x + w - 16; cx += 32) {
        ctx.fillRect(cx - 3, y + 45, 6, h - 65);
        ctx.beginPath();
        ctx.arc(cx + 13, y + 48, 13, Math.PI, 0);
        ctx.strokeStyle = '#f8fafc';
        ctx.stroke();
      }

      // 中央高聳西洋巴洛克鐘樓山牆
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(x + w / 2 - 36, y + 20);
      ctx.lineTo(x + w / 2, y - 16);
      ctx.lineTo(x + w / 2 + 36, y + 20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 鐘樓大金鐘
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + 2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // 指針走動
      const secHand = this.ambientLightTick * 4;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + 2);
      ctx.lineTo(x + w / 2 + Math.cos(secHand) * 6, y + 2 + Math.sin(secHand) * 6);
      ctx.stroke();

      // 兩側商號大金旗
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x + 2, y - 8, 18, 12);
      ctx.fillRect(x + w - 20, y - 8, 18, 12);

      // 正門雙扇雕花金屬大門
      ctx.fillStyle = '#090d16';
      ctx.fillRect(loc.doorX - 22, y + h - 50, 44, 50);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.strokeRect(loc.doorX - 22, y + h - 50, 44, 50);
    }
  }

  // 建築 1：🏮 泉郊金聯成 (傳統閩南燕尾脊紅磚街屋)
  drawBuildingFujianGuild(ctx, loc, ringColor) {
    const x = loc.x;
    const y = loc.y;
    const w = loc.width;
    const h = loc.height;

    // 建築地基陰影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x + 8, y + 15, w, h);

    // 閩南清水紅磚立面 (金包銀紅磚白石工藝)
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(x, y + 20, w, h - 20);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + 20, w, h - 20);

    // 磚紋排布
    ctx.strokeStyle = 'rgba(254, 202, 202, 0.2)';
    ctx.lineWidth = 1;
    for (let r = y + 30; r < y + h - 10; r += 12) {
      ctx.beginPath();
      ctx.moveTo(x, r);
      ctx.lineTo(x + w, r);
      ctx.stroke();
    }

    // 燕尾曲脊屋頂 (閩南標誌性燕尾飛簷)
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(x - 14, y + 8); // 左飛燕尾
    ctx.quadraticCurveTo(x + w / 2, y + 22, x + w + 14, y + 8); // 右飛燕尾
    ctx.lineTo(x + w + 8, y + 24);
    ctx.quadraticCurveTo(x + w / 2, y + 28, x - 8, y + 24);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 傳統厚木朱漆大門
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(loc.doorX - 22, y + h - 42, 44, 42);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(loc.doorX - 22, y + h - 42, 44, 42);

    // 門上金銅環鋪首
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(loc.doorX - 10, y + h - 22, 3, 0, Math.PI * 2);
    ctx.arc(loc.doorX + 10, y + h - 22, 3, 0, Math.PI * 2);
    ctx.fill();

    // 兩側懸掛微晃紅燈籠
    this.drawHangingLantern(ctx, x + 16, y + 28, '糖');
    this.drawHangingLantern(ctx, x + w - 16, y + 28, '郊');
  }

  // 建築 2：🇬🇧 寶順洋行 (維多利亞殖民風格二層拱圈洋樓)
  drawBuildingWesternArcade(ctx, loc, ringColor) {
    const x = loc.x;
    const y = loc.y;
    const w = loc.width;
    const h = loc.height;

    // 陰影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x + 8, y + 15, w, h);

    // 二層紅磚洋樓外牆
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x, y + 16, w, h - 16);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + 16, w, h - 16);

    // 拱圈騎樓走廊 (3 個連續半圓紅磚拱圈)
    ctx.fillStyle = '#0f172a';
    const archW = 34;
    for (let i = 0; i < 3; i++) {
      const ax = x + 18 + i * 40;
      const ay = y + h - 48;
      ctx.beginPath();
      ctx.arc(ax + archW / 2, ay + 14, archW / 2, Math.PI, 0);
      ctx.lineTo(ax + archW, y + h);
      ctx.lineTo(ax, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef08a'; // 拱心石高光
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 二樓綠釉百葉花瓶欄杆
    ctx.fillStyle = '#15803d';
    ctx.fillRect(x + 10, y + 36, w - 20, 10);
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 10, y + 36, w - 20, 10);

    // 洋樓頂部英國商人旗幟
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 16);
    ctx.lineTo(x + w / 2, y - 6);
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + w / 2, y - 6, 16, 10);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + w / 2, y - 6, 16, 10);
  }

  // 建築 3：⚖️ 淡水海關稅務司署 (近代英法石造洋務官署)
  drawBuildingCustomsGate(ctx, loc, ringColor) {
    const x = loc.x;
    const y = loc.y;
    const w = loc.width;
    const h = loc.height;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x + 8, y + 15, w, h);

    // 白色花崗岩石造官署
    ctx.fillStyle = '#334155';
    ctx.fillRect(x, y + 18, w, h - 18);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + 18, w, h - 18);

    // 西式古典三角山花 (Pediment)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(x, y + 18);
    ctx.lineTo(x + w / 2, y + 2);
    ctx.lineTo(x + w, y + 18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.stroke();

    // 官署四根白石柱
    ctx.fillStyle = '#cbd5e1';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + 12 + i * 36, y + 22, 10, h - 22);
    }

    // 正門通道
    ctx.fillStyle = '#090d16';
    ctx.fillRect(loc.doorX - 20, y + h - 38, 40, 38);

    // 清朝海關雙龍/黃底三角海關旗
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w - 16, y + 2);
    ctx.lineTo(x + w - 16, y - 16);
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(x + w - 16, y - 16);
    ctx.lineTo(x + w + 4, y - 9);
    ctx.lineTo(x + w - 16, y - 2);
    ctx.closePath();
    ctx.fill();
  }

  // 建築 4：🚢 大稻埕碼頭貨場 / 棧房 (臨河木構高腳貨棧)
  drawBuildingDockWarehouse(ctx, loc, ringColor) {
    const x = loc.x;
    const y = loc.y;
    const w = loc.width;
    const h = loc.height;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x + 8, y + 15, w, h);

    // 粗獷木造倉庫外觀
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x, y + 18, w, h - 18);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + 18, w, h - 18);

    // 木板條紋
    ctx.strokeStyle = '#290f01';
    ctx.lineWidth = 1.5;
    for (let px = x + 16; px < x + w; px += 16) {
      ctx.beginPath();
      ctx.moveTo(px, y + 20);
      ctx.lineTo(px, y + h);
      ctx.stroke();
    }

    // 斜角波浪鐵皮頂棚
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 20);
    ctx.lineTo(x + w / 2, y + 4);
    ctx.lineTo(x + w + 8, y + 20);
    ctx.closePath();
    ctx.fill();

    // 門口吊運重物滑輪木架
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(loc.doorX, y + 18);
    ctx.lineTo(loc.doorX, y + 36);
    ctx.stroke();

    // 正門大開
    ctx.fillStyle = '#0c1322';
    ctx.fillRect(loc.doorX - 24, y + h - 40, 48, 40);
  }

  // 建築 5：☠️ 𧶄瑯暗巷私渡口 (蘆葦掩映的黑棚快蟹碼頭)
  drawBuildingSmugglerShack(ctx, loc, ringColor) {
    const x = loc.x;
    const y = loc.y;
    const w = loc.width;
    const h = loc.height;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x + 8, y + 15, w, h);

    // 破舊黑木搭棚
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(x, y + 22, w, h - 22);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + 22, w, h - 22);

    // 傾斜破損茅草油布棚頂
    ctx.fillStyle = '#44403c';
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 26);
    ctx.lineTo(x + w + 6, y + 14);
    ctx.lineTo(x + w + 4, y + 24);
    ctx.lineTo(x - 8, y + 32);
    ctx.closePath();
    ctx.fill();

    // 隱蔽蘆葦草叢 (Tall River Reeds)
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2;
    for (let rx = x - 6; rx < x + 35; rx += 7) {
      ctx.beginPath();
      ctx.moveTo(rx, y + h);
      ctx.quadraticCurveTo(rx + 6, y + h - 24, rx - 3, y + h - 36);
      ctx.stroke();
    }

    // 幽暗黑洞入口
    ctx.fillStyle = '#050505';
    ctx.fillRect(loc.doorX - 22, y + h - 38, 44, 38);

    // 搖曳防風骷髏油燈 (Flickering Smuggler Lantern)
    const flicker = Math.sin(this.ambientLightTick * 6) * 3;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.beginPath();
    ctx.arc(x + w - 16, y + 36, 16 + flicker, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x + w - 16, y + 36, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // ======================== 史前時代專屬特色建築群 (Prehistoric Taiwan Architecture) ========================
  // 史前建築 0：🛖 卑南聚落 · 板岩干欄石屋 (自家部落居所)
  drawBuildingPrehistoricHome(ctx, loc, ringColor) {
    const x = loc.x, y = loc.y, w = loc.width, h = loc.height;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(x + 6, y + 16, w, h);

    // 干欄木柱架高地基 (Stilts)
    ctx.fillStyle = '#451a03';
    for (let st = x + 15; st < x + w - 10; st += 25) {
      ctx.fillRect(st, y + h - 22, 8, 22);
    }
    // 板岩平台底座
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 8, y + h - 26, w - 16, 8);

    // 竹編藤條混泥土屋身
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 12, y + 36, w - 24, h - 60);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.2;
    for (let bx = x + 20; bx < x + w - 20; bx += 12) {
      ctx.beginPath();
      ctx.moveTo(bx, y + 36);
      ctx.lineTo(bx, y + h - 26);
      ctx.stroke();
    }

    // 卑南厚實板岩雙坡茅草屋頂
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 8);
    ctx.lineTo(x + w + 12, y + 44);
    ctx.lineTo(x - 12, y + 44);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 茅草簷口
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(x - 10, y + 42, w + 20, 5);

    // 入口木梯與柴門
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(loc.doorX - 16, y + h - 46, 32, 24);
    // 木梯
    ctx.fillStyle = '#78350f';
    ctx.fillRect(loc.doorX - 10, y + h - 22, 20, 22);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    for (let ly = y + h - 18; ly < y + h; ly += 6) {
      ctx.beginPath();
      ctx.moveTo(loc.doorX - 10, ly);
      ctx.lineTo(loc.doorX + 10, ly);
      ctx.stroke();
    }

    // 門口懸掛避邪臺灣玉玦
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(loc.doorX - 22, y + 48, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.arc(loc.doorX - 22, y + 48, 2, 0, Math.PI * 2);
    ctx.fill();

    // 門前石臼與紅陶罐
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 18, y + h - 14, 12, 12);
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.arc(x + w - 24, y + h - 8, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 史前建築 1：📿 卑南玉玦琢磨工坊
  drawBuildingPrehistoricJadeWorkshop(ctx, loc, ringColor) {
    const x = loc.x, y = loc.y, w = loc.width, h = loc.height;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(x + 6, y + 16, w, h);

    // 琢玉敞棚立柱
    ctx.fillStyle = '#522b10';
    ctx.fillRect(x + 8, y + 36, 8, h - 36);
    ctx.fillRect(x + w - 16, y + 36, 8, h - 36);
    ctx.fillRect(x + w / 2 - 4, y + 30, 8, h - 30);

    // 琢棚金黃闊葉草頂
    ctx.fillStyle = '#a16207';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 10);
    ctx.lineTo(x + w + 14, y + 42);
    ctx.lineTo(x - 14, y + 42);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 琢磨長石台與解玉砂槽
    ctx.fillStyle = '#334155';
    ctx.fillRect(x + 22, y + h - 38, w - 44, 22);
    ctx.strokeStyle = '#0284c7';
    ctx.strokeRect(x + 26, y + h - 34, 30, 14);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.fillRect(x + 27, y + h - 33, 28, 12);

    // 臺灣豐田翠玉原石 (綠光微暈)
    const jadeGlow = Math.sin(this.ambientLightTick * 3) * 2;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(x + w - 38, y + h - 26, 9 + jadeGlow, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(x + w - 40, y + h - 28, 4, 0, Math.PI * 2);
    ctx.fill();

    // 展架上的雙人獸形玉玦與玉鈴珠
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h - 25, 6, 0, Math.PI * 1.7);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + w / 2 - 1, y + h - 34, 2, 8);
  }

  // 史前建築 2：🔥 十三行煉鐵高溫工棚
  drawBuildingPrehistoricIronSmelter(ctx, loc, ringColor) {
    const x = loc.x, y = loc.y, w = loc.width, h = loc.height;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(x + 6, y + 16, w, h);

    // 粗重原木黑棚立柱
    ctx.fillStyle = '#292524';
    ctx.fillRect(x + 10, y + 34, 10, h - 34);
    ctx.fillRect(x + w - 20, y + 34, 10, h - 34);

    // 燻黑茅草棚頂
    ctx.fillStyle = '#44403c';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 12);
    ctx.lineTo(x + w + 10, y + 42);
    ctx.lineTo(x - 10, y + 42);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 高溫黏土煉鐵豎爐 (Blast Furnace)
    const firePulse = Math.sin(this.ambientLightTick * 6) * 3;
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 20, y + h - 10);
    ctx.lineTo(x + w / 2 - 14, y + 40);
    ctx.lineTo(x + w / 2 + 14, y + 40);
    ctx.lineTo(x + w / 2 + 20, y + h - 10);
    ctx.closePath();
    ctx.fill();

    // 爐膛金紅烈焰火光
    const fireGrad = ctx.createRadialGradient(x + w / 2, y + h - 26, 2, x + w / 2, y + h - 26, 18 + firePulse);
    fireGrad.addColorStop(0, '#fef08a');
    fireGrad.addColorStop(0.4, '#ea580c');
    fireGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h - 26, 18 + firePulse, 0, Math.PI * 2);
    ctx.fill();

    // 爐門炭火
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + w / 2 - 8, y + h - 28, 16, 14);

    // 雙管木風箱 (Bellows)
    ctx.fillStyle = '#57534e';
    ctx.fillRect(x + 22, y + h - 24, 20, 12);
    ctx.strokeStyle = '#a8a29e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 42, y + h - 18);
    ctx.lineTo(x + w / 2 - 10, y + h - 18);
    ctx.stroke();

    // 堆疊的鐵渣堆 (Iron Slag)
    ctx.fillStyle = '#1c1917';
    for (let sx = x + w - 38; sx < x + w - 14; sx += 7) {
      ctx.beginPath();
      ctx.arc(sx, y + h - 12, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 史前建築 3：🗿 八仙洞長濱氏族集會所
  drawBuildingPrehistoricCaveMegalith(ctx, loc, ringColor) {
    const x = loc.x, y = loc.y, w = loc.width, h = loc.height;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(x + 6, y + 16, w, h);

    // 巍峨海蝕洞岩石山壁
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.moveTo(x - 8, y + h);
    ctx.lineTo(x + 6, y + 26);
    ctx.bezierCurveTo(x + 30, y + 8, x + w - 30, y + 8, x + w - 6, y + 26);
    ctx.lineTo(x + w + 8, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#57534e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 洞穴深邃入口
    ctx.fillStyle = '#0c0a09';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h - 18, 26, Math.PI, 0);
    ctx.lineTo(x + w / 2 + 26, y + h);
    ctx.lineTo(x + w / 2 - 26, y + h);
    ctx.closePath();
    ctx.fill();

    // 卑南月形巨石柱 (Megalith Monolith)
    ctx.fillStyle = '#78716c';
    ctx.beginPath();
    ctx.roundRect(x + 16, y + 28, 14, h - 38, 4);
    ctx.fill();
    ctx.strokeStyle = '#a8a29e';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 月形石柱穿孔
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(x + 23, y + 42, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 洞口部族篝火火盆
    const ember = Math.sin(this.ambientLightTick * 5) * 2;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h - 16, 7 + ember, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h - 16, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 史前建築 4：🛶 卑南溪口竹筏渡頭
  drawBuildingPrehistoricRaftLanding(ctx, loc, ringColor) {
    const x = loc.x, y = loc.y, w = loc.width, h = loc.height;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(x + 6, y + 16, w, h);

    // 水岸木樁與竹排引橋
    ctx.fillStyle = '#522b10';
    ctx.fillRect(x + 14, y + 36, 8, h - 36);
    ctx.fillRect(x + w - 22, y + 36, 8, h - 36);

    // 竹管拼合平臺
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 10, y + 38, w - 20, 24);
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 1.2;
    for (let py = y + 42; py < y + 60; py += 5) {
      ctx.beginPath();
      ctx.moveTo(x + 10, py);
      ctx.lineTo(x + w - 10, py);
      ctx.stroke();
    }

    // 晾魚木架與魚獲
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 24, y + 14);
    ctx.lineTo(x + w - 24, y + 14);
    ctx.moveTo(x + 28, y + 14);
    ctx.lineTo(x + 28, y + 38);
    ctx.moveTo(x + w - 28, y + 14);
    ctx.lineTo(x + w - 28, y + 38);
    ctx.stroke();

    // 晾曬小魚乾
    ctx.fillStyle = '#94a3b8';
    for (let fx = x + 36; fx < x + w - 36; fx += 10) {
      ctx.fillRect(fx, y + 17, 3, 8);
    }

    // 繫留的巨竹編筏
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.roundRect(x + 18, y + h - 32, w - 36, 18, 4);
    ctx.fill();
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    for (let bx = x + 24; bx < x + w - 20; bx += 8) {
      ctx.beginPath();
      ctx.moveTo(bx, y + h - 32);
      ctx.lineTo(bx, y + h - 14);
      ctx.stroke();
    }
  }

  // 史前建築 5：🌊 黑潮外洋獨木舟泊地
  drawBuildingPrehistoricOutriggerCamp(ctx, loc, ringColor) {
    const x = loc.x, y = loc.y, w = loc.width, h = loc.height;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(x + 6, y + 16, w, h);

    // 棕櫚闊葉斜向草棚
    ctx.fillStyle = '#3f6212';
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 24);
    ctx.lineTo(x + w + 8, y + 14);
    ctx.lineTo(x + w + 4, y + 36);
    ctx.lineTo(x - 6, y + 42);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#65a30d';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 獨木舟 (Outrigger Canoe) 船體
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(x + w / 2 - 10, y + h - 22, 38, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 浮力支架 (Outrigger Float)
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.ellipse(x + w / 2 - 10, y + h - 6, 32, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#522b10';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 30, y + h - 22);
    ctx.lineTo(x + w / 2 - 30, y + h - 6);
    ctx.moveTo(x + w / 2 + 10, y + h - 22);
    ctx.lineTo(x + w / 2 + 10, y + h - 6);
    ctx.stroke();

    // 南島三角形草蓆帆 (Woven mat sail)
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.moveTo(x + w - 28, y + 22);
    ctx.lineTo(x + w - 10, y + h - 24);
    ctx.lineTo(x + w - 42, y + h - 24);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 擺放的南海瑪瑙珠與黑曜石
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.arc(x + 18, y + h - 14, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(x + 28, y + h - 14, 4.5, 0, Math.PI * 2); ctx.fill();
  }

  // 繪製傳統紅紙燈籠
  drawHangingLantern(ctx, x, y, char) {
    ctx.save();
    // 燈光光暈
    const grad = ctx.createRadialGradient(x, y + 10, 2, x, y + 10, 24);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y + 10, 24, 0, Math.PI * 2);
    ctx.fill();

    // 燈籠本體
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 7, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 燈籠文字
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, x, y + 10);
    ctx.restore();
  }

  // 4. 繪製市井歷史 NPC 群像與對話互動氣泡 (Living Historical NPCs)
  drawNPCs(ctx) {
    for (const npc of this.npcs) {
      ctx.save();
      ctx.translate(npc.x, npc.y);

      // 腳下陰影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 10, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // NPC 本體造型繪製
      if (npc.type === 'coolie') {
        // 挑茶苦力 (短褂短褲 + 肩挑扁擔茶簍)
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-6, -16, 12, 18); // 麻布短褂
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(0, -20, 7, 0, Math.PI * 2); // 斗笠竹笠
        ctx.fill();
        // 扁擔與茶簍
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-18, -14);
        ctx.lineTo(18, -14);
        ctx.stroke();
        ctx.fillStyle = '#92400e';
        ctx.fillRect(-22, -8, 8, 10);
        ctx.fillRect(14, -8, 8, 10);

      } else if (npc.type === 'westerner') {
        // 洋商約翰·陶德 (英式黑色大禮帽 + 雙排扣常服禮服)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-7, -18, 14, 20); // 禮服
        // 黑色絲絨大禮帽
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-8, -25, 16, 3);
        ctx.fillRect(-5, -34, 10, 10);
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(0, -20, 5, 0, Math.PI * 2); // 臉龐
        ctx.fill();

      } else if (npc.type === 'scholar') {
        // 買辦李春生 (藏藍綢緞長衫 + 瓜皮小帽 + 帳冊)
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(-7, -20, 14, 22); // 長袍
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, -22, 6, Math.PI, 0); // 瓜皮帽
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(6, -14, 5, 8); // 帳本

      } else if (npc.type === 'guard') {
        // 正關巡勇 (紅邊勇字號衣 + 藤牌笠帽 + 長矛)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-7, -18, 14, 20);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, -9, 3.5, 0, Math.PI * 2); // 「勇」字胸圈
        ctx.fill();
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(0, -22, 8, 0, Math.PI * 2); // 尖頂斗笠
        ctx.fill();
        // 長矛
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(9, -28);
        ctx.lineTo(9, 10);
        ctx.stroke();

      } else if (npc.type === 'tribal') {
        // 史前獵手 (皮毛短甲 + 獵弓 + 羽飾)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-6, -16, 12, 18);
        ctx.fillStyle = '#d97706';
        ctx.beginPath(); ctx.arc(0, -20, 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(3, -33); ctx.stroke();
        ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(10, -10, 10, -Math.PI / 2, Math.PI / 2); ctx.stroke();

      } else if (npc.type === 'smith') {
        // 十三行煉鐵匠 (石棉圍裙 + 鐵鉗 + 火光)
        ctx.fillStyle = '#475569';
        ctx.fillRect(-7, -17, 14, 19);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(-5, -12, 10, 14);
        ctx.fillStyle = '#fed7aa'; ctx.beginPath(); ctx.arc(0, -20, 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-10, -16); ctx.lineTo(-10, -2); ctx.stroke();

      } else if (npc.type === 'tribal_woman') {
        // 母系長老 (麻織長袍 + 貝珠項圈 + 紅陶罐)
        ctx.fillStyle = '#be185d';
        ctx.fillRect(-7, -19, 14, 21);
        ctx.fillStyle = '#fed7aa'; ctx.beginPath(); ctx.arc(0, -21, 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, -14, 5, 0, Math.PI); ctx.stroke();
        ctx.fillStyle = '#c2410c'; ctx.beginPath(); ctx.arc(8, -10, 5, 0, Math.PI * 2); ctx.fill();

      } else if (npc.type === 'stone_elder') {
        // 長濱先民長老 (灰皮粗衣 + 打製石斧)
        ctx.fillStyle = '#57534e';
        ctx.fillRect(-7, -17, 14, 19);
        ctx.fillStyle = '#d6d3d1'; ctx.beginPath(); ctx.arc(0, -20, 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-10, -20); ctx.lineTo(-10, -2); ctx.stroke();
        ctx.fillStyle = '#292524'; ctx.fillRect(-14, -20, 7, 5);

      } else if (npc.type === 'tribal_sailor') {
        // 南島遠航水手 (短短裙 + 木槳)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-6, -15, 12, 16);
        ctx.fillStyle = '#fed7aa'; ctx.beginPath(); ctx.arc(0, -19, 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(9, -26); ctx.lineTo(9, 6); ctx.stroke();
        ctx.fillStyle = '#92400e'; ctx.fillRect(6, 0, 6, 9);

      } else if (npc.type === 'dutch_soldier') {
        // 荷蘭衛兵 (藍色軍裝 + 寬簷帽 + 火槍)
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(-7, -18, 14, 20);
        ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(0, -22, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fed7aa'; ctx.beginPath(); ctx.arc(0, -20, 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(9, -28); ctx.lineTo(9, 6); ctx.stroke();

      } else {
        // 學徒 / 船伕
        ctx.fillStyle = '#475569';
        ctx.fillRect(-6, -16, 12, 18);
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(0, -20, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 頭頂身份名籤
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(-35, -44, 70, 15);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.strokeRect(-35, -44, 70, 15);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 9px "Noto Sans TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(npc.name.split('·')[0].trim(), 0, -36.5);

      // 玩家靠近時觸發時代語錄氣泡 (Proximity Historical Dialogue)
      const distToHero = Math.hypot(this.hero.x - npc.x, this.hero.y - npc.y);
      if (distToHero < 85) {
        const bubbleW = Math.min(220, ctx.measureText(npc.talk).width + 24);
        ctx.fillStyle = 'rgba(9, 14, 26, 0.96)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-bubbleW / 2, -88, bubbleW, 36, 8);
        ctx.fill();
        ctx.stroke();

        // 氣泡尖嘴
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(-4, -52);
        ctx.lineTo(4, -52);
        ctx.lineTo(0, -47);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(`【${npc.role}】`, 0, -75);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '10px "Noto Sans TC", sans-serif';
        ctx.fillText(npc.talk, 0, -60);
      }

      ctx.restore();
    }
  }

  // 5. 繪製導引雷達環境音波 (Sonar Pulse - 取消直接指向目標門口的激光箭頭)
  drawRadarPath(ctx) {
    if (!this.radarPulseTimer || this.radarPulseTimer <= 0) return;

    const progress = 1 - (this.radarPulseTimer / 1.5);
    const radius = 25 + progress * 160;
    const alpha = (1 - progress) * 0.75;

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.hero.x, this.hero.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.hero.x, this.hero.y, radius * 0.65, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(251, 191, 36, ${alpha * 0.7})`;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();
  }

  drawGhostTrails(ctx) {
    for (const trail of this.hero.ghostTrails) {
      ctx.save();
      ctx.globalAlpha = trail.alpha;
      ctx.translate(trail.x, trail.y);
      ctx.beginPath();
      ctx.arc(0, 0, this.hero.radius * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.restore();
    }
  }

  // 6. 繪製主角清代長辮、邁步動態、三階服飾躍遷與精緻五官 (Handsome Chibi RPG Hero Sprite)
  drawHero(ctx) {
    ctx.save();
    ctx.translate(this.hero.x, this.hero.y);

    const bob = Math.abs(Math.sin(this.hero.walkFrame)) * 3;
    const stride = this.hero.isMoving ? Math.sin(this.hero.walkFrame) * 8 : 0;
    const tier = this.getCurrentTier();

    // 1. 英雄腳底精緻法陣與八卦方位羅盤
    ctx.beginPath();
    ctx.ellipse(0, 16, 26, 11, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // 羅盤方位發光光圈
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 羅盤刻度
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 羅盤指針 (Direction Pointer)
    const arrowX = Math.cos(this.hero.facing) * 38;
    const arrowY = Math.sin(this.hero.facing) * 38;
    ctx.save();
    ctx.translate(arrowX, arrowY);
    ctx.rotate(this.hero.facing);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-4, -4);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. 行走雙腿交替邁步動畫 (Cloth shoes with white soles)
    // 左腳黑布鞋
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-12, 10 + stride, 8, 14, 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc'; // 千層底白邊
    ctx.fillRect(-12, 22 + stride, 8, 2.5);

    // 右腳黑布鞋
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(4, 10 - stride, 8, 14, 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(4, 22 - stride, 8, 2.5);

    // 3. 服飾與身份階層繪製 (支援自家衣裳閣換裝系統)
    const outfitId = (this.state && this.state.currentOutfit) || (tier.level === 3 ? 'outfit_magnate' : (tier.level === 2 ? 'outfit_scholar' : 'outfit_peasant'));

    if (this.currentEraId === 'era_01_prehistory') {
      // 史前裝扮：南島麻織斜衿坎肩 + 貝珠背帶 + 佩帶墨綠玉玦
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(-14, -14 - bob, 28, 26, 7);
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 斜向白色貝珠串帶
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-12, -12 - bob);
      ctx.lineTo(12, 10 - bob);
      ctx.stroke();

      // 腰間配飾：臺灣綠玉玦
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(-11, 2 - bob, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.arc(-11, 2 - bob, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 手持磨製石器工具
      ctx.fillStyle = '#64748b';
      ctx.fillRect(12, -4 - bob, 5, 12);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(12, -4 - bob, 5, 12);
    } else if (outfitId === 'outfit_peasant') {
      // 裝扮 1：布衣挑擔短打 (青布右衽短褂 + 腰帶 + 背後斜背竹編斗笠)
      ctx.fillStyle = '#1e3a5f';
      ctx.beginPath();
      ctx.roundRect(-14, -14 - bob, 28, 26, 7);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 交領白色內襯
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-4, -14 - bob);
      ctx.lineTo(2, -6 - bob);
      ctx.lineTo(7, -14 - bob);
      ctx.stroke();

      // 銅色腰帶與錢袋
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(-14, 2 - bob, 28, 4);
      // 皮革錢袋
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(10, 4 - bob, 4, 0, Math.PI * 2);
      ctx.fill();

      // 背後精編竹斗笠 (Bamboo Coolie Hat with woven texture)
      ctx.save();
      ctx.translate(0, -6 - bob);
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-12, 0); ctx.lineTo(12, 0);
      ctx.moveTo(0, -12); ctx.lineTo(0, 12);
      ctx.stroke();
      ctx.restore();

      // 手持青花茶碗
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(14, -2 - bob, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.stroke();

    } else if (outfitId === 'outfit_scholar') {
      // 裝扮 2：長衫算盤大掌櫃 (藏青綢緞長袍 + 金紋領口 + 描金折扇 + 腰繫算盤)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-15, -16 - bob, 30, 29, 7);
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 金絲滾邊
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-6, -16 - bob);
      ctx.lineTo(0, -8 - bob);
      ctx.lineTo(10, -16 - bob);
      ctx.stroke();

      // 腰間算盤 (Abacus with beads)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(11, -3 - bob, 8, 12);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.strokeRect(11, -3 - bob, 8, 12);

      // 手中優雅折扇 (Folding Fan)
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(-14, 0 - bob);
      ctx.lineTo(-22, -8 - bob);
      ctx.lineTo(-18, -14 - bob);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.stroke();

      // 瓜皮小帽 (六瓣黑緞小帽 + 頂上紅珊瑚絨結)
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(0, -22 - bob, 11, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -26 - bob, 2.8, 0, Math.PI * 2);
      ctx.fill();

    } else if (outfitId === 'outfit_comprador') {
      // 裝扮 3：英商買辦西服禮帽 (Western Comprador Suit & Fedora)
      // 深灰色三件套西裝馬甲
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(-15, -16 - bob, 30, 30, 6);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 潔白襯衫與酒紅領帶
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-5, -16 - bob);
      ctx.lineTo(5, -16 - bob);
      ctx.lineTo(0, -6 - bob);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -14 - bob);
      ctx.lineTo(0, -2 - bob);
      ctx.stroke();

      // 左手鍍銀西洋紳士手杖
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(15, -4 - bob);
      ctx.lineTo(17, 22 - bob);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(15, -5 - bob, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // 西洋深黑圓頂紳士禮帽
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-16, -23 - bob, 32, 4); // 禮帽寬簷
      ctx.fillRect(-11, -33 - bob, 22, 11); // 禮帽圓頂
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-11, -25 - bob, 22, 2.5); // 紅絲帶

    } else {
      // 裝扮 4：蘇繡金絲商賈朝珠袍 (紫金蘇繡馬褂 + 金絲步履光環 + 官頂紅戴)
      // 金色步履光環
      ctx.save();
      const glowPulse = Math.sin(this.ambientLightTick * 4) * 4;
      ctx.beginPath();
      ctx.arc(0, 0, 38 + glowPulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#4c1d95';
      ctx.beginPath();
      ctx.roundRect(-17, -18 - bob, 34, 32, 8);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 胸前祥雲團金紋
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, -4 - bob, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 翡翠金絲朝珠串
      ctx.fillStyle = '#10b981';
      for (let j = -8; j <= 8; j += 4) {
        ctx.beginPath();
        ctx.arc(j, 2 - bob + Math.abs(j) * 0.4, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 羊脂白玉佩 (Jade Medallion)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(13, 0 - bob, 7, 10);
      ctx.strokeStyle = '#eab308';
      ctx.strokeRect(13, 0 - bob, 7, 10);

      // 手中宜興紫砂小壺
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.arc(-16, -2 - bob, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // 清代官商頂戴笠帽 (紅珊瑚頂珠)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, -23 - bob, 13, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#dc2626'; // 鮮紅頂戴珊瑚
      ctx.beginPath();
      ctx.arc(0, -29 - bob, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -29 - bob, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. 【精緻英挺二次元五官】(Handsome Expressive Anime Face)
    const faceY = -18 - bob;
    // 臉龐外輪廓 (溫潤瓷白膚色)
    ctx.fillStyle = '#ffeedd';
    ctx.beginPath();
    ctx.arc(0, faceY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (this.currentEraId === 'era_01_prehistory') {
      // 史前南島先民髮型：全黑烏髮 + 部落紅編織頭帶 + 翠綠臺灣玉石飾珠
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(0, faceY, 12.5, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();

      // 部落紅編織頭帶
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, faceY - 2, 11.5, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      // 頭帶中央鑲嵌臺灣綠玉珠
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(0, faceY - 13, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6ee7b7';
      ctx.beginPath();
      ctx.arc(-1, faceY - 14, 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 清代半剃半留乾淨髮際線 (Shaved Forehead to Black Hair)
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(0, faceY, 12, Math.PI * 1.05, Math.PI * 1.95);
      ctx.fill();

      // 兩側英挺鬢角
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-12, faceY - 4, 2.5, 8);
      ctx.fillRect(9.5, faceY - 4, 2.5, 8);
    }

    // 靈動眼神與高光 (Large expressive anime eyes with specular highlights)
    // 左眼
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(-4.5, faceY + 1, 2.2, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff'; // 大高光
    ctx.beginPath();
    ctx.arc(-5.2, faceY - 0.2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath(); // 小高光
    ctx.arc(-3.8, faceY + 2.2, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // 右眼
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(4.5, faceY + 1, 2.2, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(3.8, faceY - 0.2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5.2, faceY + 2.2, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // 英挺眉毛 (Determined eyebrows)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-7.5, faceY - 3.5);
    ctx.lineTo(-2.5, faceY - 2.5);
    ctx.moveTo(2.5, faceY - 2.5);
    ctx.lineTo(7.5, faceY - 3.5);
    ctx.stroke();

    // 臉頰淡粉微暈 (Soft Rosy Blush)
    ctx.fillStyle = 'rgba(244, 114, 182, 0.4)';
    ctx.beginPath();
    ctx.arc(-6.5, faceY + 4, 2.2, 0, Math.PI * 2);
    ctx.arc(6.5, faceY + 4, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 少年自信微笑 (Charming youthful smile)
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, faceY + 4.2, 2.5, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // 5. 【清代長辮物理動態】(長辮隨人物行走與轉向物理甩動)
    if (this.hero.queueJoints && this.hero.queueJoints.length > 0) {
      ctx.save();
      ctx.translate(-this.hero.x, -this.hero.y);

      ctx.strokeStyle = '#090d16';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 逐節長辮
      for (let i = 0; i < this.hero.queueJoints.length - 1; i++) {
        const p1 = this.hero.queueJoints[i];
        const p2 = this.hero.queueJoints[i + 1];
        ctx.lineWidth = Math.max(2.5, 6 - i * 0.8);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y - bob);
        ctx.lineTo(p2.x, p2.y - bob);
        ctx.stroke();
      }

      // 辮梢紅絲繩與金墜 (Red Silk Tassel)
      const last = this.hero.queueJoints[this.hero.queueJoints.length - 1];
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(last.x, last.y - bob, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(last.x, last.y - bob + 3.5, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 6. 英雄頭頂 MOBA 等級與身份清晰看板 (Overhead Nameplate)
    const hudY = -48 - bob;
    const plateW = 116;
    const plateH = 22;

    ctx.fillStyle = 'rgba(9, 14, 26, 0.95)';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-plateW / 2, hudY - plateH / 2, plateW, plateH, 6);
    ctx.fill();
    ctx.stroke();

    // 主角姓名與身份字樣 (高對比大字)
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 11px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.fillText(`${this.state.identityName} · ${tier.name.slice(0, 4)}`, 0, hudY);
    ctx.shadowBlur = 0;

    // 精神/歷練條 (Progress bar)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-35, hudY + plateH / 2 + 2, 70, 5);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-34, hudY + plateH / 2 + 2.5, 68, 4);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(-35, hudY + plateH / 2 + 2, 70, 5);

    ctx.restore();
  }

  drawFloatingTexts(ctx) {
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = `black ${ft.size || 16}px "Noto Serif TC", sans-serif`;
      ctx.fillStyle = ft.color || '#facc15';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  addFloatingText(x, y, text, color = '#facc15', size = 18) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      size,
      alpha: 1.0
    });
  }

  // ======================== 左上角小地圖渲染 (Mini-Map) ========================
  renderMinimap() {
    if (!this.minimapCtx) return;
    const mctx = this.minimapCtx;

    mctx.save();
    mctx.setTransform(1, 0, 0, 1, 0, 0);
    mctx.clearRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);
    mctx.scale(this.dpr, this.dpr);

    const mw = 110;
    const mh = 110;

    // 縮放比例與世界橫向範圍 (橫向世界 -800 ~ 2600，總寬 3400)
    const minMapWorldX = -800;
    const totalMapW = 3400;
    const toMapX = (wx) => ((wx - minMapWorldX) / totalMapW) * mw;
    const scaleY = mh / this.worldHeight;

    // 地圖底色
    mctx.fillStyle = '#0b1120';
    mctx.fillRect(0, 0, mw, mh);

    // 淡水河水道
    mctx.fillStyle = '#0284c7';
    mctx.fillRect(0, 750 * scaleY, mw, (this.worldHeight - 750) * scaleY);

    // 木棧橋
    mctx.fillStyle = '#78350f';
    mctx.fillRect(toMapX(605), 720 * scaleY, 190 * (mw / totalMapW), 140 * scaleY);

    // 標註各大商行與地標
    const currentNode = this.models.EVENT_NODES[this.state.currentNodeId];
    for (const loc of this.models.MAP_LOCATIONS) {
      const opt = currentNode ? currentNode.options.find(o => o.targetLocationId === loc.id) : null;
      const isTarget = !!opt || loc.id === 'loc_dock';

      mctx.fillStyle = isTarget ? (loc.themeColor || '#f59e0b') : '#475569';
      mctx.beginPath();
      mctx.arc(toMapX(loc.doorX), loc.doorY * scaleY, isTarget ? 4.5 : 2.5, 0, Math.PI * 2);
      mctx.fill();
    }

    // 標註大道主線與東西方時空渡口 (-650 至 1880)
    mctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
    mctx.lineWidth = 1.5;
    mctx.beginPath();
    mctx.moveTo(toMapX(-650), 420 * scaleY);
    mctx.lineTo(toMapX(1880), 420 * scaleY);
    mctx.stroke();

    const curEraIdx = this.models.HISTORICAL_ERAS.findIndex(e => e.id === this.currentEraId);
    const isNextUnlocked = this.isCurrentEraCompleted() && !this.hasActiveQuest();

    if (!isNextUnlocked) {
      // 小地圖標註封印壁障虛線
      mctx.strokeStyle = '#f43f5e';
      mctx.lineWidth = 1.5;
      mctx.beginPath();
      mctx.moveTo(toMapX(1840), 0);
      mctx.lineTo(toMapX(1840), this.worldHeight * scaleY);
      mctx.stroke();
    }
    mctx.fillStyle = isNextUnlocked ? '#a855f7' : '#e11d48';
    mctx.beginPath();
    mctx.arc(toMapX(1880), 420 * scaleY, isNextUnlocked ? 4.5 : 3.5, 0, Math.PI * 2);
    mctx.fill();
    mctx.strokeStyle = isNextUnlocked ? '#38bdf8' : '#fda4af';
    mctx.lineWidth = 1.2;
    mctx.stroke();

    // 西方時空渡口標註 (-650)
    mctx.fillStyle = '#38bdf8';
    mctx.beginPath();
    mctx.arc(toMapX(-650), 420 * scaleY, 3.5, 0, Math.PI * 2);
    mctx.fill();
    mctx.strokeStyle = '#c084fc';
    mctx.lineWidth = 1.2;
    mctx.stroke();

    // 標註英雄自身 (亮綠金光圓點)
    mctx.fillStyle = '#22c55e';
    mctx.beginPath();
    mctx.arc(toMapX(this.hero.x), this.hero.y * scaleY, 4.5, 0, Math.PI * 2);
    mctx.fill();
    mctx.strokeStyle = '#ffffff';
    mctx.lineWidth = 1.5;
    mctx.stroke();

    // 視角雷達錐
    mctx.save();
    mctx.translate(toMapX(this.hero.x), this.hero.y * scaleY);
    mctx.rotate(this.hero.facing);
    mctx.beginPath();
    mctx.moveTo(0, 0);
    mctx.arc(0, 0, 15, -Math.PI / 4, Math.PI / 4);
    mctx.closePath();
    mctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
    mctx.fill();
    mctx.restore();

    mctx.restore();
  }

  // ======================== 輸入控制 (鍵盤與虛擬搖桿) ========================
  bindInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // 快捷鍵映射 (支援鄰近按鍵 Z X C V 與 原按鍵 J K L B)
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.handlePrimaryAction();
      } else if (e.code === 'KeyZ' || e.code === 'KeyJ') {
        this.castSkill('sprint');
      } else if (e.code === 'KeyX' || e.code === 'KeyK') {
        this.castSkill('radar');
      } else if (e.code === 'KeyC' || e.code === 'KeyL') {
        this.startDockMinigame();
      } else if (e.code === 'KeyV' || e.code === 'KeyB') {
        this.castSkill('recall');
      } else if (e.code === 'Escape') {
        this.closeAllModals();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // 支援點擊地面移動與自動尋路 (Click / Tap to Move)
    this.canvas.addEventListener('click', (e) => {
      if (this.isAnyModalOpen()) return;
      // 轉換視口點擊為世界坐標 (考慮相機位移)
      const rect = this.canvas.getBoundingClientRect();
      const cssX = e.clientX - rect.left;
      const cssY = e.clientY - rect.top;
      const worldClickX = cssX + this.camera.x;
      const worldClickY = cssY + this.camera.y;

      // 檢查是否點擊了某商號建築
      for (const loc of this.models.MAP_LOCATIONS) {
        const inBounds = worldClickX >= loc.x && worldClickX <= loc.x + loc.width &&
                         worldClickY >= loc.y && worldClickY <= loc.y + loc.height;
        const dDoor = Math.hypot(worldClickX - loc.doorX, worldClickY - loc.doorY);
        if (inBounds || dDoor < 60) {
          this.setNavTarget(loc.doorX, loc.doorY, loc.name);
          return;
        }
      }

      // 檢查是否點擊了 NPC 展開對話
      for (const npc of this.npcs) {
        const dNpc = Math.hypot(worldClickX - npc.x, worldClickY - npc.y);
        if (dNpc < 45) {
          this.setNavTarget(npc.x, npc.y + 25, npc.name.split('·')[0]);
          return;
        }
      }

      // 否則為點擊地面導航
      this.setNavTarget(worldClickX, worldClickY);
    });
  }

  setNavTarget(x, y, label = null) {
    let targetX = x;
    if ((!this.isCurrentEraCompleted() || this.hasActiveQuest()) && targetX > 1840) {
      targetX = 1840;
      this.showToast('🔒 尚未通關歷史任務，東方時空封印壁障無法通行！', 3000);
    }
    const clampedX = Math.max(-750, Math.min(2550, targetX));
    const clampedY = Math.max(50, Math.min(this.worldHeight - 50, y));

    this.hero.navTarget = {
      x: clampedX,
      y: clampedY,
      label: label,
      time: 0
    };

    if (label) {
      this.showToast(`🧭 正在前往【${label}】`);
    }

    if (window.soundFx) window.soundFx.playClick();
  }

  // 開啟行商秘笈 (常設免費文字指引，簡潔乾淨如圖一風格)
  openQuestSecretModal() {
    if (window.soundFx) window.soundFx.playClick();

    const titleEl = document.getElementById('secret-quest-title');
    const tipEl = document.getElementById('secret-quest-tip');
    const loreEl = document.getElementById('secret-quest-lore');
    const badgeEl = document.getElementById('secret-quest-badge');
    const spacetimeBanner = document.getElementById('secret-spacetime-banner');
    const spacetimeDesc = document.getElementById('secret-spacetime-desc');
    const secretNavBtn = document.getElementById('secret-modal-nav-btn');
    const curUnit = (this.currentEra && this.currentEra.currencyUnit) || '兩';

    // 情況一：若本時代「所有角色皆已通關」且當前無進行中任務：切換為【🌌 時代大滿貫·時空長河穿越秘笈】
    if (this.isCurrentEraCompleted() && !this.hasActiveQuest()) {
      if (badgeEl) badgeEl.innerText = '✨ 時代大滿貫通關';
      if (titleEl) titleEl.innerText = '🌌 紀元星軌大道 · 時空穿越秘笈';
      if (tipEl) {
        tipEl.innerHTML = '👉 <strong>本時代所有歷史人物視角皆已圓滿通關！</strong>請沿著中央星軌大道<strong class="text-yellow-300 text-xl font-black">【一直往右走 ▶】</strong>，穿過紀元星軌大道踏入<strong>【東方時空渡口】</strong>光門，即可跨越至下一個歷史時代！<br><span class="text-xs text-amber-300 font-bold">（往左走亦可踏入【西方時空渡口】回溯/漫遊時空喔！）</span>';
      }
      if (loreEl) {
        loreEl.innerText = '📜 歷史長河波瀾壯闊，下一個時代的歷史大門已為您開啟！向前奔馳踏入時空漩渦，引領新的歷史浪潮！';
      }
      if (spacetimeBanner) {
        spacetimeBanner.classList.remove('hidden');
        spacetimeBanner.className = 'p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border-2 border-emerald-400/80 mb-3 flex items-start gap-2.5 animate-pulse';
      }
      if (spacetimeDesc) {
        spacetimeDesc.innerHTML = '✨ <strong class="text-emerald-300">時空渡口已啟動！</strong>請立即沿著大道<strong class="text-yellow-300">【一直往右走 ▶】</strong>踏入東方時空渡口光門，即可穿越至下一時代！';
      }
      if (secretNavBtn) {
        secretNavBtn.innerHTML = '<span>🧭</span><span>引路前往東方渡口</span>';
        secretNavBtn.onclick = () => { this.closeModal('quest-secret-modal'); this.autoNavigateToCurrentQuest(); };
      }
      const modal = document.getElementById('quest-secret-modal');
      if (modal) modal.classList.remove('hidden');
      return;
    }

    // 情況二：當前角色任務已做完結算，但「本時代尚未全角色通關」：切換為【📜 篇章角色接續傳承秘笈】
    if (!this.hasActiveQuest()) {
      const curEraPerspectives = this.currentEra ? (this.currentEra.perspectives || []) : [];
      const totalCount = curEraPerspectives.length;
      const doneCount = curEraPerspectives.filter(p => this.playerMaster && this.playerMaster.completedPerspectives && this.playerMaster.completedPerspectives.includes(p.id)).length;
      const curIdx = curEraPerspectives.findIndex(p => p.id === this.state.identityId);
      // 由左到右、由上而下依序尋找本時代第一位尚未通關的角色
      let nextP = curEraPerspectives.find(p => !this.playerMaster || !this.playerMaster.completedPerspectives || !this.playerMaster.completedPerspectives.includes(p.id));
      if (!nextP) nextP = curEraPerspectives[(curIdx + 1) % totalCount];

      if (badgeEl) badgeEl.innerText = '📜 篇章演繹推進中';
      if (titleEl) titleEl.innerText = `📜 ${this.currentEra ? this.currentEra.year : ''} · 篇章角色接續秘笈`;
      if (tipEl) {
        tipEl.innerHTML = `👉 你已圓滿完成【${this.state.identityName}】的歷史演繹！本篇章目前進度【${doneCount} / ${totalCount} 位角色】。<br><strong class="text-amber-300">需通關本篇章全部歷史人物後，方可開啟東方時空渡口！</strong><br>請接續演繹下一位歷史人物【<strong>${nextP.name}</strong> · ${nextP.title}】！`;
      }
      if (loreEl) {
        loreEl.innerText = `📖 【${nextP.name}】歷史核心使命：${nextP.briefGoal || nextP.title || '深入體驗不同歷史人物的視角與時代風貌！'}`;
      }
      if (spacetimeBanner) {
        spacetimeBanner.classList.add('hidden');
      }
      if (secretNavBtn) {
        secretNavBtn.innerHTML = `<span>🔀</span><span>接續演繹【${nextP.name}】</span>`;
        secretNavBtn.onclick = () => {
          this.closeModal('quest-secret-modal');
          this.selectPerspectiveAndStartGame(this.currentEra.id, nextP.id);
        };
      }
      const modal = document.getElementById('quest-secret-modal');
      if (modal) modal.classList.remove('hidden');
      return;
    }

    // 尚未破關：提供任務指引
    const currentNode = this.models.EVENT_NODES[this.state.currentNodeId];
    if (!currentNode) return;

    let targetLoc = null;
    const recOpt = currentNode.options.find(o => o.isHistorical) || currentNode.options[0];
    if (recOpt) {
      targetLoc = this.models.MAP_LOCATIONS.find(l => l.id === recOpt.targetLocationId);
    }
    if (!targetLoc) targetLoc = this.models.MAP_LOCATIONS[0];

    // 取得方位描述 (如：東北方、西南方、城鎮北面)
    let dirDesc = '';
    const dx = targetLoc.doorX - (this.hero ? this.hero.x : 700);
    const dy = targetLoc.doorY - (this.hero ? this.hero.y : 500);
    const northSouth = dy < -80 ? '北' : (dy > 80 ? '南' : '');
    const eastWest = dx < -80 ? '西' : (dx > 80 ? '東' : '');
    dirDesc = (northSouth && eastWest) ? `${northSouth}${eastWest}方` : (northSouth ? `${northSouth}方` : (eastWest ? `${eastWest}方` : '近處'));

    if (badgeEl) {
      if (this.state.roleType === 'bureaucrat') {
        badgeEl.innerText = '當前政務錦囊';
      } else if (this.state.roleType === 'pioneer') {
        badgeEl.innerText = '當前先鋒錦囊';
      } else {
        badgeEl.innerText = '當前行商錦囊';
      }
    }

    // 若當前節點或解鎖的情報中有對應 clue，優先採用該 clue 精簡文字；否則由節點自動提取超精煉文本
    let bestClue = null;
    if (recOpt && recOpt.requiredClues && recOpt.requiredClues.length > 0) {
      bestClue = this.models.CLUE_DATABASE[recOpt.requiredClues[0]];
    }
    if (!bestClue && this.state.unlockedClues && this.state.unlockedClues.length > 0) {
      for (const cid of this.state.unlockedClues) {
        if (this.models.CLUE_DATABASE[cid]) {
          bestClue = this.models.CLUE_DATABASE[cid];
          break;
        }
      }
    }

    if (titleEl) {
      const eraShort = (this.currentEra ? this.currentEra.year : '當前時代');
      const roleName = this.state.roleType === 'bureaucrat' ? '政務秘笈' : (this.state.roleType === 'pioneer' ? '先鋒盟約' : '行商秘笈');
      titleEl.innerText = bestClue ? `${bestClue.icon} ${bestClue.name}` : `📜 ${eraShort} · ${roleName}`;
    }

    if (tipEl) {
      if (bestClue) {
        tipEl.innerText = bestClue.gameplayTip;
      } else {
        tipEl.innerHTML = `👉 前往${dirDesc}<strong>【${targetLoc.name}】</strong>推進歷史探索。`;
      }
    }

    if (loreEl) {
      let rawLore = bestClue ? bestClue.historicalLore : (currentNode.historicalContext || '把握歷史關鍵抉擇，引領時代前進！');
      rawLore = rawLore.replace(/^[📜📖\s]+/, '');
      loreEl.innerText = rawLore;
    }

    // 時空穿越秘笈僅在破關後動態呈現，任務進行中隱藏，保持秘笈簡約清爽
    if (spacetimeBanner) {
      spacetimeBanner.classList.add('hidden');
    }

    const GUIDE_FEE = 35;
    if (secretNavBtn) {
      secretNavBtn.innerHTML = `<span>🧭</span><span>僱嚮導帶路 (${GUIDE_FEE}${curUnit})</span>`;
      secretNavBtn.onclick = () => {
        this.closeModal('quest-secret-modal');
        this.autoNavigateToCurrentQuest();
      };
    }

    const modal = document.getElementById('quest-secret-modal');
    if (modal) modal.classList.remove('hidden');
  }

  // 自動尋路功能 (依據時代花費貨幣僱用嚮導引路，破關後免費引路至時空渡口)
  autoNavigateToCurrentQuest() {
    // 1. 若本時代已全通關且當前無進行中任務：直接引路至東方時空渡口！
    if (this.isCurrentEraCompleted() && !this.hasActiveQuest()) {
      const portalX = 1880;
      const portalY = 420;
      this.setNavTarget(portalX, portalY, '東方時空渡口');
      this.showToast('🧭 嚮導引路：本時代全部人物已通關！請沿著大道【一直往右走 ▶】踏入時空渡口！', 4000);
      return;
    }

    // 2. 若當前無任務但時代尚未全通關：引導接續演繹下一角色！
    if (!this.hasActiveQuest()) {
      const curEraPerspectives = this.currentEra ? (this.currentEra.perspectives || []) : [];
      const totalCount = curEraPerspectives.length;
      const doneCount = curEraPerspectives.filter(p => this.playerMaster && this.playerMaster.completedPerspectives && this.playerMaster.completedPerspectives.includes(p.id)).length;
      const curIdx = curEraPerspectives.findIndex(p => p.id === this.state.identityId);
      // 由左到右、由上而下依序尋找本時代第一位尚未通關的角色
      let nextP = curEraPerspectives.find(p => !this.playerMaster || !this.playerMaster.completedPerspectives || !this.playerMaster.completedPerspectives.includes(p.id));
      if (!nextP) nextP = curEraPerspectives[(curIdx + 1) % totalCount];
      this.showToast(`🔀 當前角色演繹已完成！本篇章進度 (${doneCount}/${totalCount})，需全角色通關方可開啟渡口！請接續演繹【${nextP ? nextP.name : ''}】！`, 4500);
      this.showEraSelectModal(this.currentEraId);
      return;
    }

    const currentNode = this.models.EVENT_NODES[this.state.currentNodeId];
    if (!currentNode) return;

    let targetLoc = null;
    const recOpt = currentNode.options.find(o => o.isHistorical) || currentNode.options[0];
    if (recOpt) {
      targetLoc = this.models.MAP_LOCATIONS.find(l => l.id === recOpt.targetLocationId);
    }
    if (!targetLoc) targetLoc = this.models.MAP_LOCATIONS[0];

    const curUnit = (this.currentEra && this.currentEra.currencyUnit) || '兩';
    const curName = (this.currentEra && this.currentEra.currencyName) || '銀兩';
    const guideName = this.currentEraId === 'era_01_prehistory' ? '部落嚮導' : '挑夫嚮導';
    const GUIDE_FEE = 35;

    if (this.state.silver < GUIDE_FEE) {
      if (window.soundFx) window.soundFx.playCritical();
      this.addFloatingText(this.hero.x, this.hero.y - 45, `${curName}不足 ${GUIDE_FEE} ${curUnit}！`, '#f87171', 18);
      this.showToast(`⚠️ ${curName}不足（尋路需 ${GUIDE_FEE} ${curUnit}）！${guideName}不願帶路，請免費查閱上方【📜 秘笈】自主前往，還可獲贈自力探索獎勵！`, 4500);
      setTimeout(() => this.openQuestSecretModal(), 500);
      return;
    }

    // 標記本節點曾使用過付費尋路，無法獲取自力探索獎勵
    this.usedNavGuideForCurrentNode = true;

    // 扣除費用並飄字通知
    this.state.silver -= GUIDE_FEE;
    this.renderHUD();
    if (window.soundFx) window.soundFx.playCoin();
    this.addFloatingText(this.hero.x, this.hero.y - 40, `-${GUIDE_FEE} ${curUnit} (僱${guideName})`, '#facc15', 18);

    this.setNavTarget(targetLoc.doorX, targetLoc.doorY, targetLoc.name);
    this.showToast(`🧭 ${guideName}引路中（耗費 ${GUIDE_FEE} ${curUnit}）：前往【${targetLoc.name}】做出歷史抉擇`);
  }

  autoNavigateToLocation(locId) {
    const loc = this.models.MAP_LOCATIONS.find(l => l.id === locId);
    if (!loc) return;
    this.setNavTarget(loc.doorX, loc.doorY, loc.name);
  }

  showToast(msg, duration = 3000) {
    const toast = document.getElementById('game-toast');
    const text = document.getElementById('toast-text');
    if (!toast || !text) return;

    text.innerText = msg;
    toast.classList.add('show');

    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // 繪製點擊尋路漣漪光標 (Navigation Target Ripple)
  drawNavTarget(ctx) {
    if (!this.hero.navTarget) return;
    const t = this.hero.navTarget;
    ctx.save();
    ctx.translate(t.x, t.y);

    const pulse = (this.ambientLightTick * 3) % 1;
    // 擴散光圈
    ctx.beginPath();
    ctx.arc(0, 0, 10 + pulse * 18, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(250, 204, 21, ${1 - pulse})`;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 內圈金點
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15';
    ctx.fill();

    // 金色導航標籤
    if (t.label) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-40, -32, 80, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 10px "Noto Sans TC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.label, 0, -23);
    }

    ctx.restore();
  }

  // 繪製任務導引金色羅盤指針 (Quest Compass Navigation Needle)
  drawQuestCompassNeedle(ctx) {
    if (this.currentContactZone) return; // 已抵達商號法陣
    const currentNode = this.models.EVENT_NODES[this.state.currentNodeId];
    if (!currentNode) return;

    let targetLoc = null;
    const recOpt = currentNode.options.find(o => o.isHistorical) || currentNode.options[0];
    if (recOpt) {
      targetLoc = this.models.MAP_LOCATIONS.find(l => l.id === recOpt.targetLocationId);
    }
    if (!targetLoc) return;

    const dx = targetLoc.doorX - this.hero.x;
    const dy = targetLoc.doorY - this.hero.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 75) return; // 已經很靠近，不需再指引

    const angle = Math.atan2(dy, dx);
    const orbitR = 48;
    const nx = this.hero.x + Math.cos(angle) * orbitR;
    const ny = this.hero.y + Math.sin(angle) * orbitR;

    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(angle);

    // 金色導引三角箭頭 (微幅呼吸律動)
    const pulse = Math.sin(this.ambientLightTick * 4) * 2;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(8 + pulse, 0);
    ctx.lineTo(-6, -5);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-6, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    // 距離提示小標籤 (在箭頭外側)
    const tx = this.hero.x + Math.cos(angle) * (orbitR + 20);
    const ty = this.hero.y + Math.sin(angle) * (orbitR + 20);
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(tx - 38, ty - 9, 76, 18, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 9.5px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${targetLoc.name.slice(0, 4)} ${Math.round(dist)}m`, tx, ty);
    ctx.restore();
  }

  bindJoystick() {
    const base = document.getElementById('joystick-base');
    const stick = document.getElementById('joystick-stick');
    if (!base || !stick) return;

    const maxRadius = 45;

    const handleStart = (clientX, clientY) => {
      const rect = base.getBoundingClientRect();
      this.joystick.startX = rect.left + rect.width / 2;
      this.joystick.startY = rect.top + rect.height / 2;
      this.joystick.active = true;
      handleMove(clientX, clientY);
    };

    const handleMove = (clientX, clientY) => {
      if (!this.joystick.active) return;
      const dx = clientX - this.joystick.startX;
      const dy = clientY - this.joystick.startY;
      const dist = Math.hypot(dx, dy);

      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxRadius);

      const stickX = Math.cos(angle) * clampedDist;
      const stickY = Math.sin(angle) * clampedDist;

      stick.style.transform = `translate(${stickX}px, ${stickY}px)`;

      // 正規化向量
      this.joystick.vectorX = (clampedDist / maxRadius) * Math.cos(angle);
      this.joystick.vectorY = (clampedDist / maxRadius) * Math.sin(angle);
    };

    const handleEnd = () => {
      this.joystick.active = false;
      this.joystick.vectorX = 0;
      this.joystick.vectorY = 0;
      stick.style.transform = 'translate(0px, 0px)';
    };

    // 觸控事件
    base.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      handleStart(t.clientX, t.clientY);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (this.joystick.active) {
        const t = e.touches[0];
        handleMove(t.clientX, t.clientY);
      }
    });

    window.addEventListener('touchend', () => handleEnd());

    // 滑鼠事件
    base.addEventListener('mousedown', (e) => {
      handleStart(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.joystick.active) {
        handleMove(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', () => handleEnd());
  }

  // ======================== MOBA 技能系統 ========================
  castSkill(skillName) {
    if (skillName === 'sprint') {
      if (this.skillCooldowns.sprint > 0) return;
      const SPRINT_COST = 2;
      const curUnit = (this.currentEra && this.currentEra.currencyUnit) || '兩';
      if (this.state.silver < SPRINT_COST) {
        if (window.soundFx) window.soundFx.playCritical();
        this.addFloatingText(this.hero.x, this.hero.y - 35, `⚠️ ${curUnit}不足！`, '#f87171', 16);
        this.showToast(`⚠️ 銀兩不足 ${SPRINT_COST} ${curUnit}，無法購買提神涼茶進行疾跑！可至碼頭打工賺取！`, 3000);
        return;
      }
      this.state.silver -= SPRINT_COST;
      this.renderHUD();
      this.skillCooldowns.sprint = 4.0;
      this.hero.sprintTimer = 2.5; // 2.5 秒加速衝刺
      if (window.soundFx) window.soundFx.playCritical();
      this.addFloatingText(this.hero.x, this.hero.y - 35, `⚡ 疾跑衝刺！(-${SPRINT_COST} ${curUnit})`, '#38bdf8', 16);
    } else if (skillName === 'radar') {
      if (this.skillCooldowns.radar > 0) return;
      this.skillCooldowns.radar = 6.0;
      this.radarPulseTimer = 1.5; // 1.5 秒環形探查聲波
      if (window.soundFx) window.soundFx.playLevelUp();
      this.addFloatingText(this.hero.x, this.hero.y - 35, '🔍 翻閱隨身錦囊秘笈...', '#facc15', 16);
      const currentNode = this.models.EVENT_NODES[this.state.currentNodeId];
      if (currentNode) {
        this.showToast(`📜 秘笈指引：${currentNode.historicalContext || currentNode.description || '請留意地圖各建築門匾，查閱【📜 秘笈】自主研判前往！'}`, 5000);
      }
    } else if (skillName === 'recall') {
      // 回城傳送回自家承恩商邸
      if (window.soundFx) window.soundFx.playEnter();
      this.coinVFX.burst(this.hero.x - this.camera.x, this.hero.y - this.camera.y, 25);
      const homeLoc = this.models.MAP_LOCATIONS.find(l => l.id === 'loc_player_home');
      if (homeLoc) {
        this.hero.x = homeLoc.doorX;
        this.hero.y = homeLoc.doorY + 8;
      } else {
        this.hero.x = 485;
        this.hero.y = 260;
      }
      this.hero.navTarget = null;
      const homeName = (this.currentEra && this.currentEra.homeName) || '居所';
      this.addFloatingText(this.hero.x, this.hero.y - 35, `🛖 返回${homeName}`, '#22c55e', 18);
      this.showToast(`🛖 已順利返回${homeName}！`);
      setTimeout(() => this.showHomeModal(), 400);
    }
  }

  // ======================== 歷史商業決策核心 ========================
  chooseOption(optionIndex) {
    const node = this.models.EVENT_NODES[this.state.currentNodeId];
    if (!node) return;
    const option = node.options[optionIndex];
    if (!option) return;

    const curUnit = (this.currentEra && this.currentEra.currencyUnit) || '兩';
    const curName = (this.currentEra && this.currentEra.currencyName) || '銀兩';
    const workName = (this.currentEra && this.currentEra.workActionName) || '碼頭打工';

    // 檢查本金 (無阻塞友善引導，避免醜陋 alert)
    const baseCost = option.baseCost || 0;
    if (this.state.silver < baseCost) {
      const shortage = baseCost - this.state.silver;
      this.showToast(`⚠️ 本金不足！尚缺 ${shortage} ${curUnit}，已為您自動導向【${workName}】`, 4000);
      this.addFloatingText(this.hero.x, this.hero.y - 45, `本金不足！尚缺 ${shortage} ${curUnit}`, '#f87171', 20);
      this.autoNavigateToLocation('loc_dock');
      this.hideZonePromptBubble();
      return;
    }

    this.hideZonePromptBubble();

    // 扣除本金
    this.state.silver -= baseCost;

    // 走錯路致死判定 (私渡暗巷)
    if (option.isFatalDeath) {
      if (window.soundFx) window.soundFx.playCritical();
      this.addFloatingText(this.hero.x, this.hero.y - 50, '☠️ 遭遇黑吃黑與水師查緝！', '#ef4444', 22);
      this.showConsequenceModal(option, 0, false, '致命走私');
      return;
    }

    // 計算暴擊率
    let critRate = option.criticalChance || 0.25;
    if (this.state.inventoryCollectibles.includes('relic_formosa_tea_box')) {
      critRate += 0.10;
    }

    const isCrit = Math.random() < critRate;
    const baseReward = option.baseSilverReward !== undefined ? option.baseSilverReward : (option.baseReward || 0);
    let profit = baseReward;
    let multiplierText = '標準結算';

    if (isCrit) {
      profit = Math.round(baseReward * (option.criticalMultiplier || 1.5));
      multiplierText = `時代暴擊 x${option.criticalMultiplier || 1.5}！`;
      if (window.soundFx) window.soundFx.playCritical();
      this.coinVFX.burst(window.innerWidth / 2, window.innerHeight / 2, 50);
      this.triggerCritBanner();
      this.addFloatingText(this.hero.x, this.hero.y - 50, `💥 暴擊 +${profit} ${curUnit}！`, '#ef4444', 24);
    } else {
      if (window.soundFx) window.soundFx.playCoin();
      this.coinVFX.burst(window.innerWidth / 2, window.innerHeight / 2, 25);
      this.addFloatingText(this.hero.x, this.hero.y - 50, `+${profit} ${curUnit}`, '#facc15', 20);
    }

    this.state.silver += profit;

    // 自力探訪獎勵機制：若未花銀子僱嚮導尋路、憑智慧研讀秘笈抵達，獲贈額外獎勵！
    if (!this.usedNavGuideForCurrentNode && option.isHistorical) {
      const selfBonusSilver = 15;
      const selfBonusKnow = 10;
      this.state.silver += selfBonusSilver;
      this.state.knowledge += selfBonusKnow;
      this.syncMasterProgress(0, selfBonusKnow);
      this.addFloatingText(this.hero.x, this.hero.y - 75, `🌟 熟讀秘笈·自力探索 (+${selfBonusSilver}兩, +${selfBonusKnow}博學)！`, '#38bdf8', 20);
      this.showToast(`🌟 你憑藉自身智慧研讀秘笈抵達目標，獲得自力探索獎勵 ${selfBonusSilver} 兩與 ${selfBonusKnow} 點博學！`, 4500);
    }
    this.usedNavGuideForCurrentNode = false;

    if (option.effects) {
      if (option.effects.reputationDelta) {
        this.state.reputation += option.effects.reputationDelta;
        this.syncMasterProgress(option.effects.reputationDelta, 0);
      }
      if (option.effects.knowledgeDelta) {
        this.state.knowledge += option.effects.knowledgeDelta;
        this.syncMasterProgress(0, option.effects.knowledgeDelta);
      }
      if (option.effects.gainCollectibleId) {
        this.rewardCollectible(option.effects.gainCollectibleId);
      }
    }

    if (option.isHistorical) {
      this.state.historicalDecisionsCount++;
    }

    this.state.choiceHistory.push({
      nodeTitle: node.title,
      optionText: option.text || option.actionText || '',
      isHistorical: option.isHistorical,
      profit: profit,
      isCrit: isCrit,
      consequence: option.consequence
    });

    this.checkTierProgression();
    this.renderHUD();
    this.showConsequenceModal(option, profit, isCrit, multiplierText);
  }

  triggerCritBanner() {
    const banner = document.getElementById('crit-banner');
    if (!banner) return;
    banner.classList.remove('hidden');
    setTimeout(() => {
      banner.classList.add('hidden');
    }, 1500);
  }

  showConsequenceModal(option, profit, isCrit, multiplierText) {
    const modal = document.getElementById('consequence-modal');
    if (!modal) return;

    if (option.isHistorical) {
      if (this.state.roleType === 'bureaucrat') {
        document.getElementById('cons-title').innerText = '【順應時代法制 · 頒布施行】';
      } else if (this.state.roleType === 'pioneer') {
        document.getElementById('cons-title').innerText = '【確立部族盟約 · 守護權益】';
      } else {
        document.getElementById('cons-title').innerText = '【順應時代潮流 · 簽署合約】';
      }
      document.getElementById('cons-title').className = 'text-lg font-bold text-emerald-400';
    } else {
      if (this.state.roleType === 'bureaucrat') {
        document.getElementById('cons-title').innerText = '【法制失序 · 歷史警示】';
      } else if (this.state.roleType === 'pioneer') {
        document.getElementById('cons-title').innerText = '【部族衝擊 · 歷史警示】';
      } else {
        document.getElementById('cons-title').innerText = '【架空歷史分岔】';
      }
      document.getElementById('cons-title').className = 'text-lg font-bold text-amber-400';
    }

    document.getElementById('cons-narrative').innerText = option.consequence ? (option.consequence.narrative || '') : '';

    const loreBox = document.getElementById('cons-lore');
    if (option.isHistorical) {
      loreBox.innerText = option.consequence ? (option.consequence.historicalOutcome || option.consequence.historicalFactSummary || '') : '';
      loreBox.className = 'p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm leading-relaxed';
    } else {
      loreBox.innerText = option.consequence ? (option.consequence.ifOutcome || option.consequence.hypotheticalOutcome || option.consequence.historicalOutcome || '') : '';
      loreBox.className = 'p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed';
    }

    const currency = (this.currentEra && this.currentEra.currencyUnit) || '兩';
    const profitLabel = this.state.roleType === 'bureaucrat' ? '港稅庫銀成長：' : (this.state.roleType === 'pioneer' ? '部落資產盈餘：' : '實質入袋收益：');

    document.getElementById('cons-profit').innerHTML = `
      <span class="text-slate-300 text-xs">${profitLabel}</span>
      <span class="text-amber-400 font-extrabold text-xl font-mono">+${profit} ${currency}</span>
      <span class="text-[10px] px-2 py-0.5 rounded-full ${isCrit ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-slate-300'}">${multiplierText}</span>
    `;

    const nextBtn = document.getElementById('cons-next-btn');
    nextBtn.onclick = () => {
      this.closeModal('consequence-modal');
      
      const hasExamCard = (window.TAIWAN_HISTORY_CURRICULUM && 
          window.TAIWAN_HISTORY_CURRICULUM.renderExamPrepReportCard && 
          window.TAIWAN_HISTORY_CURRICULUM.CHARACTERS[this.state.identityId]);

      if (option.nextNodeId === 'node_settlement') {
        this.state.currentNodeId = 'node_settlement';
        this.hideZonePromptBubble();
        if (hasExamCard) {
          // 先展示 108 課綱段考考點速記卡，點擊關閉後無縫開啟結算戰報卡
          window.TAIWAN_HISTORY_CURRICULUM.renderExamPrepReportCard(this.state.identityId, option, () => {
            this.renderSettlementReport();
          });
        } else {
          this.renderSettlementReport();
        }
      } else if (this.models.EVENT_NODES[option.nextNodeId]) {
        this.state.currentNodeId = option.nextNodeId;
        // 每次進入下一關，英雄回到起始點 (中間 700, 420)，不直接幫玩家移動到要去的位置
        this.hero.x = 700;
        this.hero.y = 420;
        this.hero.vx = 0;
        this.hero.vy = 0;
        this.hero.isMoving = false;
        this.hero.navTarget = null;
        this.saveActiveSession();
        this.renderHUD();
        this.hideZonePromptBubble();
        const vW = this.viewWidth || window.innerWidth;
        const vH = this.viewHeight || window.innerHeight;
        this.camera.x = 700 - vW / 2;
        this.camera.y = 420 - vH / 2;
        if (hasExamCard) {
          window.TAIWAN_HISTORY_CURRICULUM.renderExamPrepReportCard(this.state.identityId, option);
        }
      }
    };

    modal.classList.remove('hidden');
  }

  // ======================== 碼頭理貨打工小遊戲 ========================
  startDockMinigame() {
    if (window.soundFx) window.soundFx.playClick();
    this.minigameClicksLeft = 3;
    const modal = document.getElementById('minigame-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const titleEl = document.getElementById('minigame-title');
    const descEl = document.getElementById('minigame-desc');
    const curUnit = (this.currentEra && this.currentEra.currencyUnit) || '兩';
    const workName = (this.currentEra && this.currentEra.workActionName) || '打工';

    let cargoList = [];
    if (this.currentEraId === 'era_01_prehistory') {
      if (titleEl) titleEl.innerText = '卑南聚落 · 工藝理貨打工';
      if (descEl) descEl.innerHTML = `族人長老正忙著整理聚落要用於交換的石器、陶器與海外珍寶。請點擊清點 <strong>3 份物資</strong>，即可換取 30 ${curUnit}工資並探聽最新部落情報！`;
      cargoList = [
        { id: 'jade', name: '卑南臺灣玉玦', icon: '📿', hint: '豐田翠玉 · 交換至寶' },
        { id: 'pottery', name: '細繩紋紅陶罐', icon: '🏺', hint: '粗砂紅陶 · 聚落日常' },
        { id: 'iron', name: '十三行鐵斧鋌', icon: '🗡️', hint: '高溫煉鐵 · 鋒利工具' },
        { id: 'bead', name: '越洋瑪瑙珠飾', icon: '🔮', hint: '海外舶來 · 貴重交換' }
      ];
    } else if (this.currentEraId === 'era_02_international' || this.currentEraId === 'era_1642_voc') {
      if (titleEl) titleEl.innerText = '熱蘭遮商館 · 碼頭理貨打工';
      if (descEl) descEl.innerHTML = `荷蘭商館苦力正忙著將鹿皮與蔗糖裝箱裝船。請點擊清點 <strong>3 箱商貨</strong>，即可換取 30 ${curUnit}工資並探聽最新商情！`;
      cargoList = [
        { id: 'deerskin', name: '平埔生鹿皮包', icon: '🦌', hint: '日本搶手 · 外銷主力' },
        { id: 'sugar', name: '赤崁粗砂糖桶', icon: '🍯', hint: '荷蘭專賣 · 甜潤厚利' },
        { id: 'pepper', name: '南洋丁香胡椒', icon: '🌿', hint: '巴達維亞 · 香料轉口' },
        { id: 'silver', name: '荷蘭通商里爾', icon: '🪙', hint: '大員流通 · 官定銀幣' }
      ];
    } else if (this.currentEraId === 'era_03_zheng_ming') {
      if (titleEl) titleEl.innerText = '安平軍屯港 · 輜重理貨打工';
      if (descEl) descEl.innerHTML = `軍屯水師正在清點各鎮屯田儲糧與海外走私物資。請點擊清點 <strong>3 份物資</strong>，即可換取 30 ${curUnit}餉銀並探聽最新商情！`;
      cargoList = [
        { id: 'grain', name: '屯墾白米糧草', icon: '🌾', hint: '寓兵於農 · 自給自足' },
        { id: 'coin', name: '東寧通寶銅錢', icon: '🪙', hint: '鄭氏官鑄 · 海內通行' },
        { id: 'sugar', name: '外銷日本白糖', icon: '🍯', hint: '對日貿易 · 籌措軍費' },
        { id: 'ironware', name: '漳泉鐵鑄農具', icon: '⚒️', hint: '開闢荒野 · 墾殖重器' }
      ];
    } else if (this.currentEraId === 'era_04_early_qing') {
      if (titleEl) titleEl.innerText = '鹿港泉郊港 · 渡船理貨打工';
      if (descEl) descEl.innerHTML = `行郊碼頭工人正在清點往來一府二鹿的行郊商貨。請點擊清點 <strong>3 箱商貨</strong>，即可換取 30 ${curUnit}工資並探聽最新商情！`;
      cargoList = [
        { id: 'cloth', name: '泉州染織布疋', icon: '🧵', hint: '頂郊進口 · 內山搶手' },
        { id: 'rice', name: '彰化平原稻米', icon: '🌾', hint: '一府二鹿 · 濟銷閩粵' },
        { id: 'sugar', name: '糖郊精製白糖', icon: '🍯', hint: '三郊專營 · 穩健利潤' },
        { id: 'peanut', name: '笨港花生油麻', icon: '🫒', hint: '榨油作坊 · 民生要宗' }
      ];
    } else if (this.currentEraId === 'era_06_japanese_rule' || this.currentEraId === 'era_1920_modern') {
      if (titleEl) titleEl.innerText = '基隆築港 · 鐵道理貨打工';
      if (descEl) descEl.innerHTML = `鐵道縱貫線與基隆海運棧橋正忙著裝卸近代專賣物資。請點擊清點 <strong>3 箱商貨</strong>，即可換取 30 ${curUnit}日薪並探聽最新商情！`;
      cargoList = [
        { id: 'rice', name: '蓬萊米穀標準袋', icon: '🍚', hint: '磯永吉培育 · 輸日大宗' },
        { id: 'sugar', name: '新式製糖特砂', icon: '🍬', hint: '新興製糖 · 現代產業' },
        { id: 'cypress', name: '阿里山檜木方料', icon: '🪵', hint: '官營林業 · 貴重用材' },
        { id: 'newspaper', name: '臺灣民報報捆', icon: '📰', hint: '蔣渭水呼號 · 民智啟蒙' }
      ];
    } else if (this.currentEraId === 'era_07_contemporary') {
      if (titleEl) titleEl.innerText = '竹科研發物流港 · 晶圓理貨檢驗';
      if (descEl) descEl.innerHTML = `高科技園區物流倉正忙著檢驗半導體晶圓與外銷精密元件。請點擊檢驗 <strong>3 批晶圓</strong>，即可換取 30 ${curUnit}津貼並探聽最新產業情報！`;
      cargoList = [
        { id: 'wafer', name: '積體電路矽晶圓', icon: '💿', hint: '半導體奇蹟 · 護國神山' },
        { id: 'textile', name: '機能高科技紡織', icon: '👕', hint: '加工出口 · 創匯功臣' },
        { id: 'electronics', name: '光電顯示器模組', icon: '💻', hint: '資訊島嶼 · 關鍵零組件' },
        { id: 'sorghum', name: '金門陳年高粱酒', icon: '🍶', hint: '戰地戰略 · 經典佳釀' }
      ];
    } else {
      if (titleEl) titleEl.innerText = '大稻埕碼頭 · 茶商理貨打工';
      if (descEl) descEl.innerHTML = `碼頭苦力正忙著將北臺灣各處運抵的商貨裝船。請點擊清點 <strong>3 箱商貨</strong>，即可換取 30 ${curUnit}工資並探聽最新商情！`;
      cargoList = [
        { id: 'tea', name: '深坑烏龍茶簍', icon: '🍵', hint: '香氣芬芳 · 時代核心' },
        { id: 'cloth', name: '內地棉麻布疋', icon: '🧵', hint: '商賈日常 · 必備民生' },
        { id: 'sugar', name: '打狗赤砂糖罐', icon: '🍯', hint: '傳統糖郊 · 甜潤可口' },
        { id: 'camphor', name: '三峽腦木碎屑', icon: '🪵', hint: '樟腦提神 · 外銷特產' }
      ];
    }

    const container = document.getElementById('minigame-cargos');
    container.innerHTML = cargoList.map(item => `
      <button id="cargo-${item.id}" onclick="game.clickMinigameCargo('${item.id}')" 
        class="minigame-cargo-card p-4 rounded-2xl bg-slate-800/90 border-2 border-amber-500/50 hover:border-amber-400 flex flex-col items-center justify-center gap-2 group transition-all active:scale-95 shadow-lg relative overflow-hidden">
        <span class="text-4xl group-hover:scale-125 transition-transform">${item.icon}</span>
        <span class="font-serif font-black text-amber-100 text-lg">${item.name}</span>
        <span class="text-sm text-amber-300 font-bold">${item.hint}</span>
      </button>
    `).join('');

    document.getElementById('minigame-progress-text').innerText = `剩餘理貨目標：${this.minigameClicksLeft} 份`;
  }

  clickMinigameCargo(cargoId) {
    const el = document.getElementById(`cargo-${cargoId}`);
    if (el && el.classList.contains('cargo-stamped')) return;
    if (el) el.classList.add('cargo-stamped');

    if (window.soundFx) window.soundFx.playCoin();
    this.minigameClicksLeft--;
    document.getElementById('minigame-progress-text').innerText = `剩餘理貨目標：${Math.max(0, this.minigameClicksLeft)} 份`;

    if (this.minigameClicksLeft <= 0) {
      setTimeout(() => {
        this.closeModal('minigame-modal');
        const defaultClueId = (this.currentPerspective && this.currentPerspective.startingClueId) || (this.currentEraId === 'era_01_prehistory' ? 'clue_peinan_jade' : 'clue_dadaocheng_tea');
        this.rewardClue(defaultClueId);
        const curUnit = (this.currentEra && this.currentEra.currencyUnit) || '兩';
        const workName = (this.currentEra && this.currentEra.workActionName) || '打工';
        this.state.silver += 30; // 工資入袋
        this.renderHUD();
        this.showToast(`🎉 ${workName}完成！獲得 30 ${curUnit}工資與情報秘笈`);
        this.addFloatingText(this.hero.x, this.hero.y - 45, `+30 ${curUnit}！`, '#facc15', 22);
      }, 400);
    }
  }

  rewardClue(clueId) {
    const clue = this.models.CLUE_DATABASE[clueId];
    if (!clue) return;

    if (!this.state.unlockedClues.includes(clueId)) {
      this.state.unlockedClues.push(clueId);
      this.state.knowledge += 15;
      this.syncMasterProgress(0, 15);
    }

    if (window.soundFx) window.soundFx.playLevelUp();
    this.coinVFX.burst(window.innerWidth / 2, window.innerHeight / 2, 25);
    this.showClueModal(clue);
    this.renderHUD();
  }

  rewardCollectible(relicId) {
    const relic = this.models.COLLECTIBLE_DATABASE[relicId];
    if (!relic) return;
    if (!this.playerMaster.masterRelics.includes(relicId)) {
      this.playerMaster.masterRelics.push(relicId);
      this.syncMasterProgress(20, 20); // 獲得奇物給予歷史總聲望與閱歷大加成！
      if (window.soundFx) window.soundFx.playLevelUp();
      this.coinVFX.burst(window.innerWidth / 2, window.innerHeight / 2, 40);
      this.showToast(`🎉 獲得時代奇物【${relic.name}】！已收錄於行囊圖鑑！`);
      this.addFloatingText(this.hero.x, this.hero.y - 65, `🎁 獲得奇物：${relic.name}`, '#c084fc', 22);
    }
    if (!this.state.inventoryCollectibles.includes(relicId)) {
      this.state.inventoryCollectibles.push(relicId);
      this.renderHUD();
    }
  }

  showClueModal(clue) {
    const modal = document.getElementById('clue-modal');
    if (!modal) return;
    document.getElementById('clue-title').innerText = `${clue.icon} ${clue.name}`;
    document.getElementById('clue-rarity').innerText = clue.rarity;
    document.getElementById('clue-gameplay-tip').innerText = clue.gameplayTip;
    document.getElementById('clue-historical-lore').innerText = clue.historicalLore;
    modal.classList.remove('hidden');
  }

  openClueFromQuickShop() {
    if (this.state.unlockedClues.length > 0) {
      const clue = this.models.CLUE_DATABASE[this.state.unlockedClues[0]];
      this.showClueModal(clue);
    } else {
      this.rewardClue('clue_dadaocheng_tea');
    }
  }

  showTierUpModal(tier) {
    const modal = document.getElementById('tierup-modal');
    if (!modal) return;
    document.getElementById('tierup-avatar').innerText = tier.avatarArt;
    document.getElementById('tierup-name').innerText = tier.name;
    document.getElementById('tierup-desc').innerText = tier.outfitDesc;
    document.getElementById('tierup-scene').innerText = `行商地標：${tier.sceneDesc}`;
    modal.classList.remove('hidden');
  }

  renderSettlementReport() {
    this.state.currentNodeId = 'node_settlement';
    this.hideZonePromptBubble();
    if (window.soundFx) window.soundFx.playLevelUp();
    this.coinVFX.burst(window.innerWidth / 2, window.innerHeight / 2, 60);

    const modal = document.getElementById('settlement-modal');
    if (!modal) return;

    let rank = 'B';
    let title = `${this.state.identityTitle} · 穩健歷練`;
    if (this.state.silver >= 600 && this.state.historicalDecisionsCount >= 2) {
      rank = 'S';
      title = `${this.state.identityTitle} · 時代傳奇巨擘`;
    } else if (this.state.silver >= 350 || this.state.historicalDecisionsCount >= 1) {
      rank = 'A';
      title = `${this.state.identityTitle} · 歷史中流砥柱`;
    }

    // 通關破關記錄與本尊歷史總聲望/閱歷大躍升
    if (this.playerMaster) {
      if (!this.playerMaster.completedPerspectives.includes(this.state.identityId)) {
        this.playerMaster.completedPerspectives.push(this.state.identityId);
      }

      // 嚴格檢查：當前年代的所有角色視角是否皆已全部通關！
      const currentEraPerspectives = this.currentEra ? this.currentEra.perspectives : [];
      const totalPerspectiveCount = currentEraPerspectives.length;
      const completedThisEraCount = currentEraPerspectives.filter(p => this.playerMaster.completedPerspectives.includes(p.id)).length;
      const allPerspectivesDone = totalPerspectiveCount > 0 && completedThisEraCount === totalPerspectiveCount;

      if (allPerspectivesDone && !this.playerMaster.completedEras.includes(this.currentEraId)) {
        this.playerMaster.completedEras.push(this.currentEraId);
        // 自動解鎖下一時代篇章
        const curEraIdx = this.models.HISTORICAL_ERAS.findIndex(e => e.id === this.currentEraId);
        if (curEraIdx !== -1 && curEraIdx + 1 < this.models.HISTORICAL_ERAS.length) {
          const nextEra = this.models.HISTORICAL_ERAS[curEraIdx + 1];
          if (!this.playerMaster.unlockedEras.includes(nextEra.id)) {
            this.playerMaster.unlockedEras.push(nextEra.id);
          }
        }
        this.syncMasterProgress(50, 50); // 全角色大滿貫通關大獎勵！
        this.showToast(`🏆 榮耀大滿貫！已完成【${this.currentEra.title}】全部 ${totalPerspectiveCount} 位角色演繹！解鎖下一歷史篇章！`, 4500);
      } else {
        this.syncMasterProgress(20, 20);
        if (allPerspectivesDone) {
          this.showToast(`✅ 恭喜再次重溫並完成【${this.state.identityName}】的歷史演繹！`);
        } else {
          this.showToast(`✅ 恭喜完成【${this.state.identityName}】！本篇章進度 (${completedThisEraCount}/${totalPerspectiveCount})，通關全部 ${totalPerspectiveCount} 位角色即可解鎖下一時代！`, 4000);
        }
      }
      this.saveActiveSession();
    }

    const reportEraTag = document.getElementById('report-era-tag');
    if (reportEraTag && this.currentEra) {
      reportEraTag.innerText = `${this.currentEra.year} · ${this.currentEra.title} 史實輪迴戰報`;
    }

    const reportSub = document.getElementById('report-master-sub');
    if (reportSub && this.currentEra) {
      reportSub.innerText = `本尊行者：${this.playerMaster ? this.playerMaster.name : '林晨恩'} ｜ 結算時代：${this.currentEra.year}`;
    }

    const curUnit = (this.currentEra && this.currentEra.currencyUnit) || '兩';
    const curName = (this.currentEra && this.currentEra.currencyName) || '銀兩';
    const silverLabel = document.getElementById('report-silver-label');
    if (silverLabel) silverLabel.innerText = `總累積${curName}`;

    const repLabel = document.getElementById('report-rep-label');
    if (repLabel) repLabel.innerText = this.currentEraId === 'era_01_prehistory' ? '部落氏族聲望' : '時代歷史聲望';

    document.getElementById('report-rank').innerText = rank;
    document.getElementById('report-title').innerText = title;
    document.getElementById('report-silver').innerText = `${this.state.silver} ${curUnit}`;
    document.getElementById('report-reputation').innerText = `${this.playerMaster ? this.playerMaster.totalReputation : this.state.reputation} 點 (總)`;
    document.getElementById('report-knowledge').innerText = `${this.playerMaster ? this.playerMaster.totalKnowledge : this.state.knowledge} 點 (總)`;
    document.getElementById('report-collectibles').innerText = `${this.playerMaster ? this.playerMaster.masterRelics.length : this.state.inventoryCollectibles.length} 件`;

    // 根據視角呈現深入歷史總結
    let perspectiveLoreSummary = '';
    if (this.currentEraId === 'era_01_prehistory') {
      perspectiveLoreSummary = `在【舊石器至史前時代】的歲月中，你以【${this.state.identityTitle}】之身刻劃部落基業，見證從打製石器、玉石琢磨到高溫煉鐵的文明進程！`;
    } else if (this.state.roleType === 'bureaucrat') {
      perspectiveLoreSummary = `在【${this.currentEra.title}】的風雲變幻中，你以【行政官員】視角秉公執法、調解衝突，維護了法紀與財政大局！`;
    } else if (this.state.roleType === 'civilian') {
      perspectiveLoreSummary = `在【${this.currentEra.title}】的時代浪潮中，你以【平民工匠/商人】視角抓緊商機、勤勉奮鬥，成功在時代舞台中站穩腳跟！`;
    } else {
      perspectiveLoreSummary = `在【${this.currentEra.title}】的重大歷史轉折點上，你以【時代先鋒人物】視角引領潮流、突破困境，留下深遠的時代印記！`;
    }

    // 計算當前章節全角色完成進度
    const eraPerspectives = this.currentEra ? this.currentEra.perspectives : [];
    const eraDoneCount = eraPerspectives.filter(p => this.playerMaster && this.playerMaster.completedPerspectives.includes(p.id)).length;
    const isEraAllCompleted = eraPerspectives.length > 0 && eraDoneCount === eraPerspectives.length;

    let transitionLore = '';
    if (this.currentEraId === 'era_01_prehistory') {
      if (!isEraAllCompleted) {
        transitionLore = `\n⏳ 史前文化長河指引：本篇章涵蓋「舊石器長濱」、「新石器卑南玉器」與「金屬器十三行煉鐵」。請依序演繹各階段先民角色，完整親歷數千年島嶼史前文明演進！`;
      } else {
        transitionLore = `\n📜 跨入信史新章：恭喜完整體驗島嶼史前三大文化階段！臺灣歷史即將揮別史前時代，迎來 17 世紀大航海時代的信史篇章！`;
      }
    }

    const summaryText = `${perspectiveLoreSummary} 累計完成 ${this.state.choiceHistory.length} 次重大歷史決策，達成 ${Math.round((this.state.historicalDecisionsCount / Math.max(1, this.state.choiceHistory.length)) * 100)}% 史實關鍵節點吻合率！\n👑 本年代演繹進度：【${eraDoneCount} / ${eraPerspectives.length} 位角色】${isEraAllCompleted ? '（已全面破關解鎖下一篇章！）' : `（需將本篇章全部角色皆通關，方可跨入下一歷史時代）`}${transitionLore}`;
    document.getElementById('report-summary').innerText = summaryText;

    // 動態更新「切換本年代下一視角」按鈕 (由左到右優先推薦未通關角色)
    const switchBtn = document.getElementById('btn-switch-perspective');
    if (switchBtn && this.currentEra) {
      const curEraPerspectives = this.currentEra.perspectives || [];
      let nextP = curEraPerspectives.find(p => !this.playerMaster || !this.playerMaster.completedPerspectives || !this.playerMaster.completedPerspectives.includes(p.id));
      if (!nextP) {
        const curIdx = curEraPerspectives.findIndex(p => p.id === this.state.identityId);
        nextP = curEraPerspectives[(curIdx + 1) % curEraPerspectives.length];
      }
      const isNextDone = this.playerMaster && this.playerMaster.completedPerspectives.includes(nextP.id);
      let btnLabel = '';
      if (this.currentEraId === 'era_01_prehistory') {
        if (nextP.id === 'peinan_artisan') btnLabel = `👉 探索下一史前階段：【卑南玉工長老 · 新石器玉玦】`;
        else if (nextP.id === 'shisanhang_smith') btnLabel = `👉 探索下一史前階段：【十三行鐵匠 · 金屬器時代】`;
        else if (nextP.id === 'amis_elder') btnLabel = `👉 探索南島社會：【阿美族長老 · 原住民組織】`;
        else btnLabel = `${isNextDone ? '重溫' : '接續演繹'}【${nextP.name} · ${nextP.title}】`;
      } else {
        btnLabel = `${isNextDone ? '重溫' : '接續演繹'}【${nextP.name} · ${nextP.title}】`;
      }
      switchBtn.innerHTML = `<span>🔀</span><span>${btnLabel}</span>`;
    }

    // 動態更新「下一時代按鈕」：若本年代未全破，置灰鎖定並明確提示
    const nextEraBtn = document.getElementById('btn-next-era');
    if (nextEraBtn) {
      const curEraIdx = this.models.HISTORICAL_ERAS.findIndex(e => e.id === this.currentEraId);
      const nextEra = this.models.HISTORICAL_ERAS[(curEraIdx + 1) % this.models.HISTORICAL_ERAS.length];
      if (isEraAllCompleted) {
        nextEraBtn.className = "w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer";
        const nextTitle = this.currentEraId === 'era_01_prehistory' ? `跨入信史時期！啟程【${nextEra.year} ${nextEra.title.split('・')[0]}】` : `解鎖！啟程【${nextEra.year} ${nextEra.title.split('・')[0]}】`;
        nextEraBtn.innerHTML = `<span>⏩</span><span>${nextTitle}</span>`;
      } else {
        nextEraBtn.className = "w-full sm:flex-1 py-3.5 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs sm:text-sm border border-white/10 flex items-center justify-center gap-1.5 cursor-not-allowed";
        nextEraBtn.innerHTML = `<span>🔒</span><span>下個年代未解鎖 (${eraDoneCount}/${eraPerspectives.length}角色)</span>`;
      }
    }
    // 動態更新時空渡口指引條：全破時引導渡口，未全破時引導接續下一角色
    const reportSpacetimeBanner = document.getElementById('report-spacetime-banner');
    const reportSpacetimeTitle = document.getElementById('report-spacetime-title');
    const reportSpacetimeDesc = document.getElementById('report-spacetime-desc');
    const reportSpacetimeBtn = document.getElementById('report-spacetime-btn');

    if (reportSpacetimeBanner) {
      if (isEraAllCompleted) {
        reportSpacetimeBanner.className = 'p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border border-emerald-400/60 mb-5 flex items-center justify-between gap-3 text-left animate-pulse';
        if (reportSpacetimeTitle) reportSpacetimeTitle.innerText = '🌌 榮耀大滿貫！本時代所有歷史人物全數通關！';
        if (reportSpacetimeDesc) reportSpacetimeDesc.innerText = '返回地圖後【一直往右走 ▶】即可踏入東方時空渡口跨越至下一時代！';
        if (reportSpacetimeBtn) {
          reportSpacetimeBtn.innerHTML = '<span>🧭</span><span>引路前往渡口</span>';
          reportSpacetimeBtn.onclick = () => { this.closeModal('settlement-modal'); this.autoNavigateToCurrentQuest(); };
        }
      } else {
        const curEraPerspectives = this.currentEra ? (this.currentEra.perspectives || []) : [];
        // 由左到右、由上而下依序尋找本時代第一位尚未通關的角色
        let nextUncompletedP = curEraPerspectives.find(p => !this.playerMaster || !this.playerMaster.completedPerspectives || !this.playerMaster.completedPerspectives.includes(p.id));
        if (!nextUncompletedP) nextUncompletedP = curEraPerspectives[0];

        reportSpacetimeBanner.className = 'p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/90 to-slate-900/90 border border-purple-400/50 mb-5 flex items-center justify-between gap-3 text-left';
        if (reportSpacetimeTitle) reportSpacetimeTitle.innerText = `⏳ 篇章進行中：已通關 (${eraDoneCount}/${eraPerspectives.length}) 位角色`;
        if (reportSpacetimeDesc) reportSpacetimeDesc.innerText = `需通關本篇章全部歷史人物方可開啟時空渡口！請接續演繹【${nextUncompletedP.name}】。`;
        if (reportSpacetimeBtn) {
          reportSpacetimeBtn.innerHTML = `<span>🔀</span><span>接續演繹【${nextUncompletedP.name}】</span>`;
          reportSpacetimeBtn.onclick = () => {
            this.closeModal('settlement-modal');
            this.selectPerspectiveAndStartGame(this.currentEra.id, nextUncompletedP.id);
          };
        }
      }
    }

    modal.classList.remove('hidden');
  }

  // ======================== HUD 渲染與介面更新 ========================
  renderHUD() {
    const tier = this.getCurrentTier();
    const currentOutfitObj = this.models.HOME_OUTFITS ? this.models.HOME_OUTFITS.find(o => o.id === this.state.currentOutfit) : null;

    const hudAvatar = document.getElementById('hud-avatar');
    if (hudAvatar) hudAvatar.innerText = (this.currentPerspective && this.currentPerspective.avatar) || this.state.avatar || '🧭';

    // 1. 本尊主要身份 (林晨恩，貫穿全場、跨時代累積)
    const masterName = document.getElementById('hud-master-name');
    if (masterName) masterName.innerText = this.playerMaster ? this.playerMaster.name : '林晨恩';

    const totalPts = ((this.playerMaster && this.playerMaster.totalReputation) || 0) + ((this.playerMaster && this.playerMaster.totalKnowledge) || 0);
    const masterTiers = this.models.MASTER_PROGRESSION_TIERS || [];
    let currentMasterTier = masterTiers[0];
    for (const t of masterTiers) {
      if (totalPts >= t.minPoints) currentMasterTier = t;
    }
    const masterTierEl = document.getElementById('hud-master-tier');
    if (masterTierEl && currentMasterTier) {
      masterTierEl.innerText = `${currentMasterTier.badge} Lv.${currentMasterTier.level}`;
    }

    // 2. 第二身份 (當前時代扮演角色)
    const hudRoleBadge = document.getElementById('hud-role-badge');
    if (hudRoleBadge) {
      hudRoleBadge.innerText = `🎭 ${this.state.identityName} (${this.state.identityTitle})`;
    }

    const hudRep = document.getElementById('hud-reputation');
    if (hudRep) hudRep.innerText = this.playerMaster ? this.playerMaster.totalReputation : this.state.reputation;
    const hudKnow = document.getElementById('hud-knowledge');
    if (hudKnow) hudKnow.innerText = this.playerMaster ? this.playerMaster.totalKnowledge : this.state.knowledge;
    const hudRelic = document.getElementById('hud-relic-count');
    if (hudRelic) hudRelic.innerText = `${this.playerMaster ? this.playerMaster.masterRelics.length : this.state.inventoryCollectibles.length} 件`;

    const homeBadge = document.getElementById('hud-home-level-badge');
    if (homeBadge) homeBadge.innerText = `Lv.${this.state.homeLevel || 1}`;

    // 當前年代專屬貨幣與住宅名稱更新
    const curUnit = (this.currentEra && this.currentEra.currencyUnit) || '兩';
    const curName = (this.currentEra && this.currentEra.currencyName) || '行商銀兩';
    const homeName = (this.currentEra && this.currentEra.homeName) || '承恩宅邸';
    const homeDesc = (this.currentEra && this.currentEra.homeActionDesc) || '建造 · 換裝 · 收租 ▶';
    const workName = (this.currentEra && this.currentEra.workActionName) || '碼頭打工';

    const hudCurrencyName = document.getElementById('hud-currency-name');
    if (hudCurrencyName) hudCurrencyName.innerText = curName;

    const hudSilver = document.getElementById('hud-silver');
    if (hudSilver) hudSilver.innerText = `${this.state.silver} ${curUnit}`;

    const hudHomeName = document.getElementById('hud-home-name');
    if (hudHomeName) hudHomeName.innerText = homeName;

    const hudHomeDesc = document.getElementById('hud-home-desc');
    if (hudHomeDesc) hudHomeDesc.innerText = homeDesc;

    // 地圖與打工小標籤動態更新
    const minimapTitle = document.getElementById('minimap-title');
    if (minimapTitle && this.currentEra && this.currentEra.minimapTitle) {
      minimapTitle.innerText = this.currentEra.minimapTitle;
    }
    const minimapYear = document.getElementById('minimap-year-text');
    if (minimapYear && this.currentEra && this.currentEra.minimapYearBadge) {
      minimapYear.innerText = this.currentEra.minimapYearBadge;
    }

    const hintWorkText = document.getElementById('hint-work-text');
    if (hintWorkText) hintWorkText.innerText = workName;

    const skillDockLabel = document.getElementById('skill-dock-label');
    if (skillDockLabel) skillDockLabel.innerText = `${workName.slice(0, 2)} [C]`;

    const quickClueBadge = document.getElementById('quick-clue-badge');
    if (quickClueBadge) {
      quickClueBadge.innerText = this.state.unlockedClues.length > 0 ? '已掌握' : '點擊解鎖';
      quickClueBadge.className = this.state.unlockedClues.length > 0 ? 'text-xs px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-bold' : 'text-xs px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 font-bold';
    }

    const currentNode = this.models.EVENT_NODES[this.state.currentNodeId];
    const isCompleted = this.isCurrentEraCompleted() && !this.hasActiveQuest();
    const navBtnText = document.getElementById('nav-btn-text');
    const eraTag = document.getElementById('quest-era-tag');
    const titleText = document.getElementById('quest-title-text');

    if (isCompleted) {
      if (navBtnText) navBtnText.innerText = '尋路 (時空渡口)';
      if (eraTag) eraTag.innerText = '時空渡口已啟動';
      if (titleText) titleText.innerText = '✨ 本時代所有人物已全通關！請【一直往右走 ▶】前往時空渡口穿越至下一時代！';
    } else if (!this.hasActiveQuest()) {
      // 當前角色已完成，但本時代尚未全部通關
      const curEraPerspectives = this.currentEra ? (this.currentEra.perspectives || []) : [];
      const totalCount = curEraPerspectives.length;
      const doneCount = curEraPerspectives.filter(p => this.playerMaster && this.playerMaster.completedPerspectives && this.playerMaster.completedPerspectives.includes(p.id)).length;
      // 由左到右、由上而下依序尋找本時代第一位尚未通關的角色
      let nextP = curEraPerspectives.find(p => !this.playerMaster || !this.playerMaster.completedPerspectives || !this.playerMaster.completedPerspectives.includes(p.id));
      if (!nextP) nextP = curEraPerspectives[(curIdx + 1) % totalCount];

      if (navBtnText) navBtnText.innerText = `接續 (${nextP ? nextP.name : '下個人物'})`;
      if (eraTag) eraTag.innerText = `篇章進度 ${doneCount}/${totalCount}`;
      if (titleText) {
        titleText.innerText = `✨ 已完成【${this.state.identityName}】！請接續演繹本篇章下一位角色【${nextP ? nextP.name : ''}】(${doneCount}/${totalCount})`;
      }
    } else {
      if (navBtnText) navBtnText.innerText = `尋路 (35${curUnit})`;
      if (eraTag) {
        if (currentNode && currentNode.era) {
          const parts = currentNode.era.split(' · ');
          eraTag.innerText = parts[0] || currentNode.era;
        } else if (this.currentEra) {
          eraTag.innerText = this.currentEra.year || '當前時代';
        }
      }
      if (titleText) {
        titleText.innerText = currentNode ? currentNode.title : '操縱角色前往聚落工坊做出歷史決策！';
      }
    }

    // 當前角色階段即時存檔 (確保刷新頁面進度不遺失)
    this.saveActiveSession();
  }

  // 雙重身份檔案面板 (主體林晨恩 vs 時代扮演角色)
  showIdentityModal() {
    if (window.soundFx) window.soundFx.playClick();
    const modal = document.getElementById('identity-modal');
    if (!modal) return;

    // 1. 本尊檔案
    const masterNameEl = document.getElementById('id-master-name');
    if (masterNameEl) masterNameEl.innerText = this.playerMaster.name || '林晨恩';

    const totalPts = (this.playerMaster.totalReputation || 0) + (this.playerMaster.totalKnowledge || 0);
    const tiers = this.models.MASTER_PROGRESSION_TIERS || [];
    let currentTier = tiers[0];
    for (const t of tiers) {
      if (totalPts >= t.minPoints) currentTier = t;
    }

    const tierBadgeEl = document.getElementById('id-master-tier-badge');
    if (tierBadgeEl && currentTier) {
      tierBadgeEl.innerText = `${currentTier.name}`;
      tierBadgeEl.className = `text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r ${currentTier.color} text-white font-black shadow`;
    }

    const repEl = document.getElementById('id-master-rep');
    if (repEl) repEl.innerText = this.playerMaster.totalReputation;

    const knowEl = document.getElementById('id-master-know');
    if (knowEl) knowEl.innerText = this.playerMaster.totalKnowledge;

    const relicsEl = document.getElementById('id-master-relics');
    if (relicsEl) relicsEl.innerText = `${this.playerMaster.masterRelics ? this.playerMaster.masterRelics.length : 0} 件`;

    const masterHomeLevel = (this.playerMaster && this.playerMaster.homeLevel) || this.state.homeLevel || 1;
    const masterHomeEl = document.getElementById('id-master-home');
    if (masterHomeEl) masterHomeEl.innerText = `Lv.${masterHomeLevel}`;

    const erasEl = document.getElementById('id-master-eras');
    if (erasEl) erasEl.innerText = `${this.playerMaster.completedEras ? this.playerMaster.completedEras.length : 0} / ${this.models.HISTORICAL_ERAS ? this.models.HISTORICAL_ERAS.length : 7}`;

    // 2. 時代角色檔案 (隨時動態同步當前實際遊玩視角角色，絕不停留在舊角色)
    const p = this.currentPerspective || 
              (this.currentEra && this.currentEra.perspectives.find(x => x.id === this.state.identityId)) || 
              (this.currentEra && this.currentEra.perspectives[0]);

    const activeRoleBadge = (p && p.roleTypeBadge) || this.state.roleTypeBadge || '🎭 時代角色';
    const activeTitle = (p && p.title) || this.state.identityTitle || '';
    const activeName = (p && p.name) || this.state.identityName || '';
    const activeAvatar = (p && p.avatar) || this.state.avatar || '🎭';
    const activeGoal = (p && (p.briefGoal || p.missionObjective || p.perspectiveFocus)) || '';
    const activeSubEra = (p && (p.subEraYear || p.period)) || (this.currentEra && this.currentEra.year) || '當前時代';
    const eraTitle = (this.currentEra && this.currentEra.title) || '';

    const eraBadgeEl = document.getElementById('id-era-badge');
    if (eraBadgeEl) eraBadgeEl.innerText = `${activeSubEra} · ${eraTitle}`;

    const idEraAvatar = document.getElementById('id-era-avatar');
    if (idEraAvatar) idEraAvatar.innerText = activeAvatar;

    const eraNameEl = document.getElementById('id-era-name');
    if (eraNameEl) eraNameEl.innerText = `${activeTitle} · ${activeName}`;

    const eraTitleEl = document.getElementById('id-era-title');
    if (eraTitleEl) eraTitleEl.innerText = `${activeRoleBadge} ｜ ${activeTitle}`;

    const eraGoalEl = document.getElementById('id-era-goal');
    if (eraGoalEl) eraGoalEl.innerText = activeGoal;

    const curUnit = (this.currentEra && this.currentEra.currencyUnit) || '兩';
    const curName = (this.currentEra && this.currentEra.currencyName) || '行商銀兩';
    const idSilverLabel = document.getElementById('id-era-silver-label');
    if (idSilverLabel) idSilverLabel.innerText = `💰 當前時空持有${curName}`;

    const eraSilverEl = document.getElementById('id-era-silver');
    if (eraSilverEl) eraSilverEl.innerText = `${this.state.silver} ${curUnit}`;

    const homeObj = this.models.HOME_TIERS ? this.models.HOME_TIERS.find(h => h.level === masterHomeLevel) : null;
    const homeName = (this.currentEra && this.currentEra.homeName) || (homeObj ? homeObj.name : '臨河竹籬小茅舍');
    const eraHomeEl = document.getElementById('id-era-home');
    if (eraHomeEl) eraHomeEl.innerText = `${homeName} (Lv.${masterHomeLevel})`;

    modal.classList.remove('hidden');
  }

  updateGameTimer() {
    // 經商歷練計時器已由使用者需求移除，保留空方法避免潛在回呼報錯
  }

  toggleLoreModal() {
    const node = this.models.EVENT_NODES[this.state.currentNodeId];
    if (!node) return;
    document.getElementById('lore-title').innerText = `${node.era} · 時代縱覽`;
    document.getElementById('lore-content').innerText = node.historicalContext;
    const modal = document.getElementById('lore-modal');
    if (modal) modal.classList.remove('hidden');
  }

  toggleSound() {
    if (!window.soundFx) return;
    window.soundFx.muted = !window.soundFx.muted;
    const icon = document.getElementById('btn-sound-icon');
    const text = document.getElementById('btn-sound-text');
    if (icon) icon.innerText = window.soundFx.muted ? '🔇' : '🔊';
    if (text) text.innerText = window.soundFx.muted ? '靜音' : '音效';
    this.showToast(window.soundFx.muted ? '🔇 音效已關閉' : '🔊 音效已開啟', 2000);
  }

  showInventoryModal() {
    if (window.soundFx) window.soundFx.playClick();
    const modal = document.getElementById('inventory-modal');
    if (!modal) return;

    // 1. 渲染時代情報
    const cluesDiv = document.getElementById('inv-clues-list');
    if (this.state.unlockedClues.length === 0) {
      cluesDiv.innerHTML = '<p class="text-sm sm:text-base text-slate-400">尚未獲得時代情報，走訪地標或碼頭打工即可獲取。</p>';
    } else {
      cluesDiv.innerHTML = this.state.unlockedClues.map(cid => {
        const c = this.models.CLUE_DATABASE[cid];
        if (!c) return '';
        return `
          <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-800/90 border border-amber-500/40 flex items-start gap-3.5 shadow">
            <span class="text-3xl shrink-0">${c.icon}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 flex-wrap">
                <p class="font-bold text-amber-200 text-base sm:text-lg">${c.name} <span class="text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">(${c.rarity})</span></p>
                <span class="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded font-bold border border-emerald-500/30">已掌握</span>
              </div>
              <p class="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">${c.gameplayTip}</p>
              <p class="text-[11px] text-slate-400 mt-1 italic">${c.historicalLore}</p>
              ${c.howToGet ? `<p class="text-[10px] text-amber-400/90 mt-1 font-bold">📍 獲取途徑：${c.howToGet}</p>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    // 2. 渲染跨時代奇物文物圖鑑
    const relicsDiv = document.getElementById('inv-relics-list');
    const masterRelicsList = this.playerMaster ? this.playerMaster.masterRelics : this.state.inventoryCollectibles;
    const allRelicKeys = Object.keys(this.models.COLLECTIBLE_DATABASE);

    let html = '';
    if (masterRelicsList.length === 0) {
      html += '<p class="text-sm text-slate-400 mb-4">尚未收集到歷史奇物文物。</p>';
    } else {
      html += masterRelicsList.map(rid => {
        const r = this.models.COLLECTIBLE_DATABASE[rid];
        if (!r) return '';
        return `
          <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-800/90 border border-purple-500/40 flex items-start gap-3.5 shadow mb-3">
            <span class="text-3xl shrink-0">${r.icon}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 flex-wrap">
                <p class="font-bold text-purple-200 text-base sm:text-lg">${r.name} <span class="text-xs font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">(${r.rarity})</span></p>
                <span class="text-[10px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded font-bold border border-purple-500/40">👑 跨時代永久珍藏</span>
              </div>
              <p class="text-xs sm:text-sm text-emerald-300 font-bold mt-1">✨ ${r.buff}</p>
              <p class="text-xs text-slate-300 mt-1 leading-relaxed">${r.lore}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    // 未收集的奇物提供提示
    const uncollectedKeys = allRelicKeys.filter(k => !masterRelicsList.includes(k));
    if (uncollectedKeys.length > 0) {
      html += `
        <div class="mt-4 pt-3 border-t border-white/10">
          <p class="text-xs text-slate-400 font-bold mb-2">🔍 待探尋時代奇物（點亮全圖鑑）：</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${uncollectedKeys.map(k => {
              const r = this.models.COLLECTIBLE_DATABASE[k];
              return `
                <div class="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2 text-xs">
                  <span class="text-xl opacity-40">${r.icon}</span>
                  <div class="min-w-0 flex-1">
                    <p class="font-bold text-slate-400 truncate">${r.name}</p>
                    <p class="text-[10px] text-amber-400/80 truncate">💡 ${r.howToGet || '探索或商業決策解鎖'}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    relicsDiv.innerHTML = html;
    modal.classList.remove('hidden');
  }

  closeModal(modalId) {
    if (window.soundFx) window.soundFx.playClick();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  closeAllModals() {
    document.querySelectorAll('.moba-modal-backdrop').forEach(m => m.classList.add('hidden'));
    const bubble = document.getElementById('zone-prompt-bubble');
    if (bubble) bubble.classList.add('hidden');
  }

  isAnyModalOpen() {
    const activeModals = document.querySelectorAll('.moba-modal-backdrop:not(.hidden)');
    if (activeModals.length > 0) return true;
    if (document.getElementById('exam-review-modal')) return true;
    return false;
  }

  // ======================== 玩家自家宅邸系統 (Player Estate & Wardrobe) ========================
  showHomeModal() {
    if (window.soundFx) window.soundFx.playClick();
    this.renderHomeModal();
    const modal = document.getElementById('home-modal');
    if (modal) modal.classList.remove('hidden');
  }

  switchHomeTab(tabName) {
    if (window.soundFx) window.soundFx.playClick();
    const tabs = ['upgrade', 'relics', 'wardrobe', 'rent'];
    tabs.forEach(t => {
      const btn = document.getElementById(`tab-btn-${t}`);
      const content = document.getElementById(`home-tab-content-${t}`);
      if (btn) {
        if (t === tabName) btn.classList.add('active');
        else btn.classList.remove('active');
      }
      if (content) {
        if (t === tabName) content.classList.remove('hidden');
        else content.classList.add('hidden');
      }
    });
    this.renderHomeModal();
  }

  renderHomeModal() {
    const homeLevel = (this.playerMaster && this.playerMaster.homeLevel) || this.state.homeLevel || 1;
    const currentTier = this.models.HOME_TIERS[homeLevel - 1] || this.models.HOME_TIERS[0];
    const nextTier = this.models.HOME_TIERS[homeLevel] || null;
    const currentOutfit = (this.playerMaster && this.playerMaster.currentOutfit) || this.state.currentOutfit || 'outfit_peasant';
    const unlockedOutfits = (this.playerMaster && this.playerMaster.unlockedOutfits) || this.state.unlockedOutfits || ['outfit_peasant'];
    const accumulatedRent = (this.playerMaster && this.playerMaster.accumulatedRent) || this.state.accumulatedRent || 0;

    // 頂部與當前房屋
    const badge = document.getElementById('home-modal-badge');
    if (badge) badge.innerText = `Lv.${homeLevel} ${currentTier.name}`;

    const curIcon = document.getElementById('home-current-icon');
    const icons = ['🛖', '🏡', '🏛️', '🏰'];
    if (curIcon) curIcon.innerText = icons[Math.min(homeLevel - 1, 3)];

    const curName = document.getElementById('home-current-name');
    if (curName) curName.innerText = currentTier.name;
    const curDesc = document.getElementById('home-current-desc');
    if (curDesc) curDesc.innerText = `${currentTier.desc} 【特權加成】：${currentTier.buffText}`;

    // 下一級擴建預覽
    const nextCard = document.getElementById('home-next-tier-card');
    if (nextCard) {
      if (!nextTier) {
        nextCard.innerHTML = `
          <div class="text-center py-6">
            <span class="text-4xl block mb-2">👑</span>
            <h4 class="font-serif font-black text-xl text-yellow-300">已起造至家族頂級極致豪邸！</h4>
            <p class="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              林晨恩家族坐擁巴洛克西洋鐘樓豪邸，名震萬國！每週期皆可領取 80 兩巨額洋行分紅，跨時空永久延續！
            </p>
          </div>
        `;
      } else {
        const costBadge = document.getElementById('home-next-cost-badge');
        if (costBadge) costBadge.innerText = `造價：${nextTier.cost} 兩銀子`;
        const nextName = document.getElementById('home-next-name');
        if (nextName) nextName.innerText = nextTier.name;
        const nextDesc = document.getElementById('home-next-desc');
        if (nextDesc) nextDesc.innerText = nextTier.desc;
        const nextBuff = document.getElementById('home-next-buff');
        if (nextBuff) nextBuff.innerText = nextTier.buffText;

        const upBtn = document.getElementById('btn-upgrade-home');
        if (upBtn) {
          if (this.state.silver < nextTier.cost) {
            const shortage = nextTier.cost - this.state.silver;
            upBtn.disabled = true;
            upBtn.className = 'w-full mt-4 py-3 rounded-xl bg-slate-800 text-slate-500 font-black text-sm cursor-not-allowed border border-white/5';
            upBtn.innerHTML = `<span>⚠️</span><span>銀兩不足（尚缺 ${shortage} 兩，請先經商賺錢）</span>`;
          } else {
            upBtn.disabled = false;
            upBtn.className = 'w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-base shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer';
            upBtn.innerHTML = `<span>🔨</span><span>花費 ${nextTier.cost} 兩銀子起造新居</span>`;
          }
        }
      }
    }

    // 歷史珍寶賞坊列表渲染
    const silverDisplay = document.getElementById('relics-shop-current-silver');
    if (silverDisplay) silverDisplay.innerText = `${this.state.silver} 兩`;

    const relicsShopContainer = document.getElementById('home-relics-shop-list');
    if (relicsShopContainer && this.models.COLLECTIBLE_DATABASE) {
      const masterRelicsList = (this.playerMaster && this.playerMaster.masterRelics) || this.state.inventoryCollectibles || [];
      const relicKeys = Object.keys(this.models.COLLECTIBLE_DATABASE);

      relicsShopContainer.innerHTML = relicKeys.map(k => {
        const relic = this.models.COLLECTIBLE_DATABASE[k];
        if (!relic) return '';
        const isOwned = masterRelicsList.includes(relic.id);
        const price = relic.price !== undefined ? relic.price : 100;
        const canAfford = this.state.silver >= price;

        let actionBtnHtml = '';
        if (isOwned) {
          actionBtnHtml = `
            <span class="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-black text-xs flex items-center gap-1 shrink-0">
              <span>✅</span><span>已永久珍藏</span>
            </span>
          `;
        } else if (price === 0) {
          actionBtnHtml = `
            <span class="px-3 py-1.5 rounded-xl bg-slate-800 text-amber-300 border border-amber-500/30 font-black text-xs flex items-center gap-1 shrink-0">
              <span>🧺</span><span>開局隨身贈予</span>
            </span>
          `;
        } else {
          actionBtnHtml = `
            <button onclick="game.buyRelicFromShop('${relic.id}')" 
              class="px-3.5 py-1.5 rounded-xl ${canAfford ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-md cursor-pointer' : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'} font-black text-xs flex items-center gap-1 transition-transform active:scale-95 shrink-0">
              <span>🪙</span><span>花費 ${price} 兩珍藏</span>
            </button>
          `;
        }

        return `
          <div class="p-3 sm:p-4 rounded-2xl ${isOwned ? 'bg-slate-900/90 border border-emerald-500/40' : 'bg-slate-900/80 border border-amber-500/30'} flex items-center justify-between gap-3 shadow">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="w-12 h-12 rounded-2xl ${isOwned ? 'bg-emerald-950/60 border border-emerald-500/50' : 'bg-slate-800 border border-amber-500/40'} flex items-center justify-center text-3xl shrink-0 shadow">
                ${relic.icon}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h5 class="font-serif font-black text-sm sm:text-base ${isOwned ? 'text-emerald-200' : 'text-amber-100'}">${relic.name}</h5>
                  <span class="text-[10px] px-1.5 py-0.5 rounded-full ${isOwned ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'} font-bold">${relic.rarity}</span>
                </div>
                <p class="text-xs text-emerald-300 font-bold mt-0.5">✨ 特權：${relic.buff}</p>
                <p class="text-[11px] text-slate-300 mt-0.5 line-clamp-1">${relic.lore}</p>
              </div>
            </div>
            ${actionBtnHtml}
          </div>
        `;
      }).join('');
    }

    // 衣裳閣列表渲染
    const outfitsContainer = document.getElementById('home-outfits-list');
    if (outfitsContainer && this.models.HOME_OUTFITS) {
      outfitsContainer.innerHTML = this.models.HOME_OUTFITS.map(outfit => {
        const isUnlocked = unlockedOutfits.includes(outfit.id) || homeLevel >= outfit.tierLevelRequired;
        const isEquipped = currentOutfit === outfit.id;

        return `
          <div onclick="${isUnlocked ? `game.changeOutfit('${outfit.id}')` : ''}" 
            class="outfit-card ${isEquipped ? 'active-equipped' : ''} ${!isUnlocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}">
            <div class="w-16 h-16 rounded-2xl bg-slate-800/90 border-2 ${isEquipped ? 'border-amber-400' : 'border-white/10'} flex items-center justify-center text-4xl shrink-0 shadow">
              ${outfit.avatar}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1">
                <span class="font-black text-base sm:text-lg text-amber-100">${outfit.name}</span>
                <span class="text-xs sm:text-sm px-2.5 py-0.5 rounded-full ${isEquipped ? 'bg-amber-500 text-black font-black' : (isUnlocked ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'bg-slate-700 text-slate-400 font-bold')}">
                  ${isEquipped ? '已穿戴 ✓' : (isUnlocked ? '可換穿' : `需宅邸 Lv.${outfit.tierLevelRequired}`)}
                </span>
              </div>
              <p class="text-sm sm:text-base text-slate-200 mt-1 leading-relaxed">${outfit.desc}</p>
              <p class="text-xs sm:text-sm text-amber-300 font-mono font-bold mt-1">✦ 特效：${outfit.passive}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    // 租金顯示
    const rentDisp = document.getElementById('home-accumulated-rent');
    if (rentDisp) rentDisp.innerText = `${accumulatedRent} 兩`;
  }

  buyRelicFromShop(relicId) {
    const relic = this.models.COLLECTIBLE_DATABASE[relicId];
    if (!relic) return;
    const masterRelicsList = (this.playerMaster && this.playerMaster.masterRelics) || this.state.inventoryCollectibles || [];
    if (masterRelicsList.includes(relicId)) {
      this.showToast(`ℹ️ 家族已永久珍藏【${relic.name}】！`);
      return;
    }
    const price = relic.price !== undefined ? relic.price : 100;
    const curUnit = (this.currentEra && this.currentEra.currencyUnit) || '兩';
    if (this.state.silver < price) {
      if (window.soundFx) window.soundFx.playCritical();
      const shortage = price - this.state.silver;
      this.showToast(`⚠️ 銀兩不足！珍藏【${relic.name}】需 ${price} ${curUnit}（尚缺 ${shortage} ${curUnit}）。可至碼頭打工或商號經商賺取！`, 4000);
      return;
    }

    this.state.silver -= price;
    if (this.playerMaster) {
      if (!this.playerMaster.masterRelics.includes(relicId)) {
        this.playerMaster.masterRelics.push(relicId);
      }
      this.playerMaster.totalReputation = (this.playerMaster.totalReputation || 0) + 20;
      this.playerMaster.totalKnowledge = (this.playerMaster.totalKnowledge || 0) + 15;
      this.saveMasterProfile();
    }
    if (this.state.inventoryCollectibles && !this.state.inventoryCollectibles.includes(relicId)) {
      this.state.inventoryCollectibles.push(relicId);
    }

    if (window.soundFx) {
      if (window.soundFx.playLevelUp) window.soundFx.playLevelUp();
      else window.soundFx.playCoin();
    }
    this.coinVFX.burst(this.hero.x - this.camera.x, this.hero.y - this.camera.y, 45);
    this.addFloatingText(this.hero.x, this.hero.y - 45, `🏆 典藏國寶：${relic.name}！(-${price}兩)`, '#facc15', 20);
    this.showToast(`🎉 成功花費 ${price} 兩珍藏歷史國寶【${relic.name}】！永久收錄至家族博古架，獲得全時空特權加成！`, 4500);

    this.renderHUD();
    this.renderHomeModal();
  }

  upgradeHome() {
    const homeLevel = (this.playerMaster && this.playerMaster.homeLevel) || this.state.homeLevel || 1;
    const nextTier = this.models.HOME_TIERS[homeLevel];
    if (!nextTier) return;

    if (this.state.silver < nextTier.cost) {
      const shortage = nextTier.cost - this.state.silver;
      this.showToast(`⚠️ 銀兩不足！尚缺 ${shortage} 兩，快去碼頭打工或洽談洋行商路！`);
      return;
    }

    // 扣除銀兩，提升本尊永久宅邸等級
    this.state.silver -= nextTier.cost;
    const newLevel = homeLevel + 1;
    if (this.playerMaster) this.playerMaster.homeLevel = newLevel;
    this.state.homeLevel = newLevel;

    // 自動解鎖對應服裝，永久歸屬於本尊
    if (nextTier.unlockedOutfitId) {
      if (this.playerMaster && !this.playerMaster.unlockedOutfits.includes(nextTier.unlockedOutfitId)) {
        this.playerMaster.unlockedOutfits.push(nextTier.unlockedOutfitId);
      }
      if (!this.state.unlockedOutfits.includes(nextTier.unlockedOutfitId)) {
        this.state.unlockedOutfits.push(nextTier.unlockedOutfitId);
      }
      if (this.playerMaster) this.playerMaster.currentOutfit = nextTier.unlockedOutfitId;
      this.state.currentOutfit = nextTier.unlockedOutfitId; // 自動換上新衣服
    }

    // 慶賀特效與音效
    if (window.soundFx) window.soundFx.playLevelUp();
    this.coinVFX.burst(this.hero.x - this.camera.x, this.hero.y - this.camera.y, 40);

    this.addFloatingText(this.hero.x, this.hero.y - 45, `🏡 家族宅邸升級為【${nextTier.name}】！`, '#facc15', 20);
    this.showToast(`🎉 恭喜！林晨恩家族起造了【${nextTier.name}】，解鎖新衣裝與商號分紅！基業永久繼承！`);

    this.renderHUD();
    this.renderHomeModal();
  }

  changeOutfit(outfitId) {
    const unlockedOutfits = (this.playerMaster && this.playerMaster.unlockedOutfits) || this.state.unlockedOutfits || [];
    if (!unlockedOutfits.includes(outfitId)) {
      const outfit = this.models.HOME_OUTFITS.find(o => o.id === outfitId);
      this.showToast(`⚠️ 此衣裝需擴建宅邸至 Lv.${outfit.tierLevelRequired} 方可解鎖穿戴！`);
      return;
    }

    if (this.playerMaster) this.playerMaster.currentOutfit = outfitId;
    this.state.currentOutfit = outfitId;
    const outfit = this.models.HOME_OUTFITS.find(o => o.id === outfitId);

    if (window.soundFx) window.soundFx.playClick();
    this.addFloatingText(this.hero.x, this.hero.y - 35, `👘 換穿【${outfit.name}】`, '#38bdf8', 16);
    this.showToast(`👘 已換穿【${outfit.name}】，以嶄新姿態行商大稻埕！`);

    this.renderHUD();
    this.renderHomeModal();
  }

  collectHomeRent() {
    const amount = (this.playerMaster && this.playerMaster.accumulatedRent) || this.state.accumulatedRent || 0;
    if (amount <= 0) {
      this.showToast('ℹ️ 當前聚寶盆暫無累積店租，稍等片刻鋪面即可產生收益！');
      return;
    }

    this.state.silver += amount;
    if (this.playerMaster) this.playerMaster.accumulatedRent = 0;
    this.state.accumulatedRent = 0;

    if (window.soundFx) window.soundFx.playCoin();
    this.coinVFX.burst(this.hero.x - this.camera.x, this.hero.y - this.camera.y, 30);

    this.addFloatingText(this.hero.x, this.hero.y - 40, `+${amount} 兩 (家族商號分紅)`, '#22c55e', 20);
    this.showToast(`💰 成功領取 ${amount} 兩林晨恩家族商號鋪面租金分紅！`);

    this.renderHUD();
    this.renderHomeModal();
  }

  toggleHelpModal() {
    if (window.soundFx) window.soundFx.playClick();
    const modal = document.getElementById('help-modal');
    if (modal) {
      if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
      } else {
        modal.classList.add('hidden');
      }
    }
  }

  // ======================== 臺灣歷史長河 · 七大年代章節與 21 位角色視角選擇系統 ========================
  showEraSelectModal(targetEraId = null) {
    if (window.soundFx) window.soundFx.playClick();
    this.selectedEraId = targetEraId || this.selectedEraId || this.currentEraId || this.models.HISTORICAL_ERAS[0].id;
    this.renderEraSelectModal();
    const modal = document.getElementById('era-select-modal');
    if (modal) modal.classList.remove('hidden');

    // 橫向滑動自動居中選中卡片
    setTimeout(() => {
      const eraBtnsContainer = document.getElementById('era-buttons-container');
      if (eraBtnsContainer) {
        const activeBtn = eraBtnsContainer.querySelector('.era-step-btn.active');
        if (activeBtn) {
          activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }, 100);
  }

  switchEraTab(eraId) {
    if (window.soundFx) window.soundFx.playClick();
    this.selectedEraId = eraId;
    this.renderEraSelectModal();

    // 橫向平滑滾動至選中按鈕
    const eraBtnsContainer = document.getElementById('era-buttons-container');
    if (eraBtnsContainer) {
      const activeBtn = eraBtnsContainer.querySelector('.era-step-btn.active');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }

  // 判斷當前角色是否有正在進行中的歷史決策任務
  hasActiveQuest() {
    if (!this.state || !this.state.currentNodeId) return false;
    if (this.state.currentNodeId === 'node_settlement') return false;
    const node = this.models.EVENT_NODES ? this.models.EVENT_NODES[this.state.currentNodeId] : null;
    return !!(node && node.options && node.options.length > 0);
  }

  // 判斷當前時代是否已破關 (必須通關當前時代全部角色視角)
  isCurrentEraCompleted() {
    if (!this.currentEra) return false;
    const curEraPerspectives = this.currentEra.perspectives || [];
    const totalPerspectiveCount = curEraPerspectives.length;
    if (totalPerspectiveCount === 0) return true;

    if (this.playerMaster && this.playerMaster.completedPerspectives) {
      const doneCount = curEraPerspectives.filter(p => this.playerMaster.completedPerspectives.includes(p.id)).length;
      const allDone = doneCount >= totalPerspectiveCount;

      if (allDone) {
        if (this.playerMaster.completedEras && !this.playerMaster.completedEras.includes(this.currentEra.id)) {
          this.playerMaster.completedEras.push(this.currentEra.id);
        }
        const curEraIdx = this.models.HISTORICAL_ERAS.findIndex(e => e.id === this.currentEraId);
        if (curEraIdx !== -1 && curEraIdx + 1 < this.models.HISTORICAL_ERAS.length) {
          const nextEra = this.models.HISTORICAL_ERAS[curEraIdx + 1];
          if (this.playerMaster.unlockedEras && !this.playerMaster.unlockedEras.includes(nextEra.id)) {
            this.playerMaster.unlockedEras.push(nextEra.id);
          }
        }
        this.saveMasterProfile();
        return true;
      } else {
        // 若本時代尚未全人物通關，主動修復清理被舊版誤加入的 completedEras
        if (this.playerMaster.completedEras && this.playerMaster.completedEras.includes(this.currentEra.id)) {
          this.playerMaster.completedEras = this.playerMaster.completedEras.filter(id => id !== this.currentEra.id);
          this.saveMasterProfile();
        }
        return false;
      }
    }

    return false;
  }

  // 判斷時代篇章是否已解鎖 (第1章預設開啟，後續時代需通關前置時代或已解鎖)
  isEraUnlocked(eraIndex) {
    if (eraIndex === 0) return true;
    if (!this.models.HISTORICAL_ERAS || eraIndex < 0 || eraIndex >= this.models.HISTORICAL_ERAS.length) return false;
    const targetEra = this.models.HISTORICAL_ERAS[eraIndex];
    if (this.playerMaster && this.playerMaster.unlockedEras && this.playerMaster.unlockedEras.includes(targetEra.id)) {
      return true;
    }
    const prevEra = this.models.HISTORICAL_ERAS[eraIndex - 1];
    if (this.playerMaster && this.playerMaster.completedEras && this.playerMaster.completedEras.includes(prevEra.id)) {
      return true;
    }
    if (prevEra && prevEra.perspectives && this.playerMaster && this.playerMaster.completedPerspectives) {
      const doneCount = prevEra.perspectives.filter(p => this.playerMaster.completedPerspectives.includes(p.id)).length;
      if (doneCount >= Math.min(3, prevEra.perspectives.length)) {
        return true;
      }
    }
    // 活躍存檔中即為該時代時，直接允許延續
    try {
      const saved = localStorage.getItem('taiwan_rpg_active_session');
      if (saved) {
        const s = JSON.parse(saved);
        if (s && s.eraId === targetEra.id) return true;
      }
    } catch (e) {}
    return false;
  }

  // 判斷特定時代中的特定人物視角是否已解鎖 (依「由左到右、由上而下」順序線性演繹解鎖)
  isPerspectiveUnlocked(era, pIndex) {
    if (!era || !era.perspectives || pIndex < 0 || pIndex >= era.perspectives.length) return false;
    // 1. 每時代第 1 位角色（左上角第一位）預設開放
    if (pIndex === 0) return true;

    const targetP = era.perspectives[pIndex];

    // 2. 本身已通關過
    if (this.playerMaster && this.playerMaster.completedPerspectives && this.playerMaster.completedPerspectives.includes(targetP.id)) {
      return true;
    }

    // 3. 本尊檔案或當前活躍記錄即為該角色
    if (this.playerMaster && this.playerMaster.lastActivePerspectiveId === targetP.id) {
      return true;
    }
    try {
      const saved = localStorage.getItem('taiwan_rpg_active_session');
      if (saved) {
        const s = JSON.parse(saved);
        if (s && s.identityId === targetP.id) return true;
      }
    } catch (e) {}

    // 4. 由左到右、由上而下線性推進：前一位角色已通關，本角色即解鎖
    const prevP = era.perspectives[pIndex - 1];
    const prevDone = prevP && this.playerMaster && this.playerMaster.completedPerspectives && this.playerMaster.completedPerspectives.includes(prevP.id);
    if (prevDone) return true;

    // 5. 容錯補正：若後續角色（右側或下方）已經通關過或為當前演繹中角色，前面的前置角色絕對不能上鎖
    const laterUnlocked = era.perspectives.slice(pIndex + 1).some(p => {
      const isDone = this.playerMaster && this.playerMaster.completedPerspectives && this.playerMaster.completedPerspectives.includes(p.id);
      const isActive = this.state && this.state.eraId === era.id && this.state.identityId === p.id;
      return isDone || isActive;
    });
    if (laterUnlocked) return true;

    return false;
  }

  showLockedEraToast(eraId) {
    if (window.soundFx) window.soundFx.playClick();
    const eraIdx = this.models.HISTORICAL_ERAS.findIndex(e => e.id === eraId);
    const era = eraIdx !== -1 ? this.models.HISTORICAL_ERAS[eraIdx] : null;
    const prevEra = eraIdx > 0 ? this.models.HISTORICAL_ERAS[eraIdx - 1] : null;
    this.showToast(`🔒 時代篇章【${era ? era.title : ''}】尚未解鎖！需先通關前置篇章【${prevEra ? prevEra.title : ''}】全部歷史人物視角！`, 3500);
  }

  showLockedPerspectiveToast(prevRoleName) {
    if (window.soundFx) window.soundFx.playClick();
    this.showToast(`🔒 該歷史人物視角尚未解鎖！需先完成前置角色【${prevRoleName || '前一位人物'}】的歷史演繹！`, 3500);
  }

  renderEraSelectModal() {
    const eraBtnsContainer = document.getElementById('era-buttons-container');
    const selectedEraIdx = this.models.HISTORICAL_ERAS.findIndex(e => e.id === this.selectedEraId);
    const selectedEra = selectedEraIdx !== -1 ? this.models.HISTORICAL_ERAS[selectedEraIdx] : this.models.HISTORICAL_ERAS[0];
    const isSelectedEraUnlocked = this.isEraUnlocked(selectedEraIdx !== -1 ? selectedEraIdx : 0);
    const prevEraObj = selectedEraIdx > 0 ? this.models.HISTORICAL_ERAS[selectedEraIdx - 1] : null;

    // 1. 動態渲染頂部 7 大時代按鈕 (支援橫向平滑滾動)
    if (eraBtnsContainer) {
      eraBtnsContainer.innerHTML = this.models.HISTORICAL_ERAS.map((era, index) => {
        const isActive = era.id === this.selectedEraId;
        const isCompleted = this.playerMaster && this.playerMaster.completedEras.includes(era.id);
        const unlocked = this.isEraUnlocked(index);

        // 計算此時代已通關角色數
        const doneRoleCount = era.perspectives.filter(p => this.playerMaster && this.playerMaster.completedPerspectives.includes(p.id)).length;
        const totalRoleCount = era.perspectives.length;

        let badgeText = era.badge;
        let badgeClass = isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300';
        if (!unlocked) {
          badgeText = '🔒 未解鎖';
          badgeClass = 'bg-slate-900 text-slate-400 border border-slate-700';
        } else if (isCompleted) {
          badgeText = '🏆 通關';
          badgeClass = 'bg-emerald-500 text-slate-950';
        } else if (doneRoleCount > 0) {
          badgeText = `進度 ${doneRoleCount}/${totalRoleCount}`;
          badgeClass = 'bg-sky-500 text-slate-950';
        }

        const lockBtnClass = !unlocked ? 'opacity-60 border-slate-800' : '';

        return `
          <button onclick="game.switchEraTab('${era.id}')" 
            class="era-step-btn ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${lockBtnClass}">
            <div class="flex items-center gap-1 mb-0.5">
              <span class="text-base sm:text-lg">${unlocked ? era.icon : '🔒'}</span>
              <span class="text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-full ${badgeClass}">${badgeText}</span>
            </div>
            <span class="font-serif font-black text-xs sm:text-sm whitespace-nowrap ${isActive ? 'text-amber-200' : (unlocked ? 'text-slate-200' : 'text-slate-400')}">${era.year}</span>
            <span class="text-[10px] text-slate-300 font-bold truncate max-w-[120px]">${era.period}</span>
          </button>
        `;
      }).join('');
    }

    const isEraCompleted = this.playerMaster && this.playerMaster.completedEras.includes(selectedEra.id);

    // 2. 更新選中年代簡介卡片 (關鍵詞標籤 + 一句話目標 + 未解鎖警示橫幅)
    const titleEl = document.getElementById('era-modal-title');
    const tagsEl = document.getElementById('era-modal-tags');
    const descEl = document.getElementById('era-modal-desc');

    if (titleEl) {
      titleEl.innerHTML = `
        <span class="flex items-center gap-1.5 flex-wrap">
          <span>${isSelectedEraUnlocked ? selectedEra.icon : '🔒'}</span>
          <span>${selectedEra.title} (${selectedEra.year})</span>
          <span class="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30 font-bold">${selectedEra.badge}</span>
          ${isEraCompleted ? '<span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">🏆 本篇章已通關</span>' : ''}
          ${!isSelectedEraUnlocked ? '<span class="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">🔒 篇章未解鎖</span>' : ''}
        </span>
      `;
    }
    if (tagsEl && selectedEra.tags) {
      tagsEl.innerHTML = selectedEra.tags.map(tag => `<span class="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">#${tag}</span>`).join('');
    }
    if (descEl) {
      let extraNotice = '';
      if (!isSelectedEraUnlocked) {
        extraNotice = `<div class="mt-2 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2 font-bold">
          <span class="text-xl shrink-0">🔒</span>
          <span>本時代篇章尚未解鎖！需先通關前置時代【${prevEraObj ? prevEraObj.title : ''}】全部歷史人物演繹，方可開啟！</span>
        </div>`;
      }
      descEl.innerHTML = `<div>🎯 核心目標：${selectedEra.summary || selectedEra.desc || ''}</div>${extraNotice}`;
    }

    // 3. 連動渲染下方該時代所有角色視角 (依序解鎖，嚴格線性)
    const perspectivesContainer = document.getElementById('era-perspectives-grid');
    if (perspectivesContainer) {
      perspectivesContainer.innerHTML = selectedEra.perspectives.map((p, pIndex) => {
        const prevP = pIndex > 0 ? selectedEra.perspectives[pIndex - 1] : null;
        const isCurrent = this.state && this.state.eraId === selectedEra.id && this.state.identityId === p.id;
        const isCompleted = this.playerMaster && this.playerMaster.completedPerspectives.includes(p.id);

        let roleBadgeClass = 'role-badge-civilian';
        if (p.roleType === 'bureaucrat') roleBadgeClass = 'role-badge-bureaucrat';
        else if (p.roleType === 'pioneer') roleBadgeClass = 'role-badge-pioneer';

        const goalText = p.briefGoal || p.missionObjective || p.perspectiveFocus || '';

        // 判斷人物是否解鎖 (嚴格按順序演繹解鎖)
        const isPerspectiveUnlocked = isSelectedEraUnlocked && this.isPerspectiveUnlocked(selectedEra, pIndex);

        let statusBadgeHtml = '';
        let buttonHtml = '';

        if (!isSelectedEraUnlocked) {
          statusBadgeHtml = '<span class="text-[10px] bg-slate-900 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-black">🔒 篇章未解鎖</span>';
          buttonHtml = `
            <button onclick="game.showLockedEraToast('${selectedEra.id}')" 
              class="w-full py-2 rounded-xl bg-slate-800/80 text-slate-400 border border-slate-700 font-bold text-xs sm:text-sm shadow flex items-center justify-center gap-1 cursor-not-allowed hover:bg-slate-800">
              <span>🔒 篇章未解鎖 (需通關【${prevEraObj ? prevEraObj.title.split('・')[0] : ''}】)</span>
            </button>
          `;
        } else if (!isPerspectiveUnlocked) {
          statusBadgeHtml = '<span class="text-[10px] bg-slate-900 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-black">🔒 視角未解鎖</span>';
          buttonHtml = `
            <button onclick="game.showLockedPerspectiveToast('${prevP ? prevP.name : ''}')" 
              class="w-full py-2 rounded-xl bg-slate-800/80 text-slate-400 border border-slate-700 font-bold text-xs sm:text-sm shadow flex items-center justify-center gap-1 cursor-not-allowed hover:bg-slate-800">
              <span>🔒 需先通關【${prevP ? prevP.name : ''}】</span>
            </button>
          `;
        } else if (isCurrent) {
          statusBadgeHtml = '<span class="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-black shadow">演繹中</span>';
          buttonHtml = `
            <button onclick="game.closeModal('era-select-modal')" 
              class="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow flex items-center justify-center gap-1 transition-transform active:scale-95 cursor-pointer">
              <span>🔄 繼續當前演繹</span>
            </button>
          `;
        } else if (isCompleted) {
          statusBadgeHtml = '<span class="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-black">✅ 已通關</span>';
          buttonHtml = `
            <button onclick="game.selectPerspectiveAndStartGame('${selectedEra.id}', '${p.id}')" 
              class="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs sm:text-sm shadow flex items-center justify-center gap-1 transition-transform active:scale-95 cursor-pointer">
              <span>🔄 重溫歷史視角</span>
            </button>
          `;
        } else {
          buttonHtml = `
            <button onclick="game.selectPerspectiveAndStartGame('${selectedEra.id}', '${p.id}')" 
              class="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow flex items-center justify-center gap-1 transition-transform active:scale-95 cursor-pointer">
              <span>🚀 選擇此視角展開冒險</span>
            </button>
          `;
        }

        const isCardLocked = !isSelectedEraUnlocked || !isPerspectiveUnlocked;
        const cardLockClass = isCardLocked ? 'opacity-70 grayscale-[30%] bg-slate-950/80 border-slate-800' : '';

        return `
          <div class="perspective-card ${isCurrent ? 'selected' : ''} ${isCompleted ? 'completed' : ''} ${cardLockClass}">
            <div>
              <div class="flex items-center justify-between gap-1 mb-1.5">
                <span class="text-[11px] font-black px-2 py-0.5 rounded-full ${roleBadgeClass}">
                  ${p.roleTypeBadge}
                </span>
                ${statusBadgeHtml}
              </div>

              <div class="flex items-center gap-2.5 my-1.5">
                <div class="w-11 h-11 rounded-xl bg-slate-800/90 border border-amber-500/60 flex items-center justify-center text-2xl shadow shrink-0">
                  ${p.avatar}
                </div>
                <div class="flex-1 min-w-0">
                  <h5 class="font-serif font-black text-base text-amber-100">${p.name}</h5>
                  <p class="text-xs font-bold text-amber-400 truncate">${p.title}</p>
                </div>
              </div>

              <div class="p-2 rounded-lg bg-black/50 border border-white/10 text-xs mb-2 leading-snug">
                <span class="text-sky-300 font-bold">🎯 任務：</span>
                <span class="text-slate-200 font-medium">${goalText}</span>
              </div>

              <div class="text-[11px] font-bold text-slate-400 mb-2">
                💰 初始資本: <b class="text-amber-300 font-mono">${p.initialSilver}${(selectedEra.currencyUnit) || '兩'}</b>
              </div>
            </div>

            ${buttonHtml}
          </div>
        `;
      }).join('');
    }
  }

  selectPerspectiveAndStartGame(eraId, perspectiveId, isFreshStart = false) {
    const eraIdx = this.models.HISTORICAL_ERAS.findIndex(e => e.id === eraId);
    if (eraIdx === -1) return;
    const era = this.models.HISTORICAL_ERAS[eraIdx];
    const pIndex = era.perspectives.findIndex(p => p.id === perspectiveId);
    if (pIndex === -1) return;

    // 嚴格校驗：時代篇章是否已解鎖
    if (!this.isEraUnlocked(eraIdx)) {
      this.showLockedEraToast(eraId);
      return;
    }

    // 嚴格校驗：人物視角是否已解鎖 (按歷史順序解鎖)
    if (!this.isPerspectiveUnlocked(era, pIndex)) {
      const prevP = pIndex > 0 ? era.perspectives[pIndex - 1] : null;
      this.showLockedPerspectiveToast(prevP ? prevP.name : '');
      return;
    }

    if (window.soundFx) window.soundFx.playLevelUp();
    this.closeModal('era-select-modal');
    this.resetGame(eraId, perspectiveId, isFreshStart);
    this.renderHUD();

    // 更新小地圖與 HUD 標記
    const minimapOverlay = document.querySelector('.minimap-overlay');
    if (minimapOverlay && this.currentEra) {
      minimapOverlay.innerText = `📍 ${this.currentEra.title.split('・')[0].split('·')[0]}`;
    }
    const minimapYear = document.querySelector('.minimap-container .font-mono span');
    if (minimapYear && this.currentEra) {
      minimapYear.innerText = `${this.currentEra.year}`;
    }

    this.coinVFX.burst(window.innerWidth / 2, window.innerHeight / 2, 40);
    this.showToast(`✨ 已進入【${this.currentEra.year} ${this.currentEra.title}】！扮演【${this.state.identityName}】（${this.state.roleTypeBadge}）`, 4000);
  }

  switchPerspectiveInSameEra() {
    this.closeModal('settlement-modal');
    if (!this.currentEra) return;
    const curEraPerspectives = this.currentEra.perspectives || [];
    // 依序尋找本時代「由左到右、由上而下」第一位尚未通關的角色
    let nextP = curEraPerspectives.find(p => !this.playerMaster || !this.playerMaster.completedPerspectives || !this.playerMaster.completedPerspectives.includes(p.id));
    if (!nextP) {
      const curIdx = curEraPerspectives.findIndex(p => p.id === this.state.identityId);
      nextP = curEraPerspectives[(curIdx + 1) % curEraPerspectives.length];
    }
    if (nextP) {
      this.selectPerspectiveAndStartGame(this.currentEra.id, nextP.id);
    }
  }

  proceedToNextEra() {
    this.closeModal('settlement-modal');

    // 嚴格校驗：本年代是否已全部角色通關
    const curEra = this.currentEra;
    const curEraPerspectives = curEra ? curEra.perspectives : [];
    const doneCount = curEraPerspectives.filter(p => this.playerMaster && this.playerMaster.completedPerspectives.includes(p.id)).length;
    const isEraAllCompleted = curEraPerspectives.length > 0 && doneCount === curEraPerspectives.length;

    if (!isEraAllCompleted) {
      if (window.soundFx) window.soundFx.playClick();
      this.showToast(`🔒 下一個年代尚未解鎖：需先通關【${curEra ? curEra.title : '本年代'}】全部 ${curEraPerspectives.length} 位角色（目前 ${doneCount}/${curEraPerspectives.length}）！`, 4000);
      // 打開歷史長河選單引導選擇下一位角色
      this.showEraSelectModal(this.currentEraId);
      return;
    }

    const curEraIdx = this.models.HISTORICAL_ERAS.findIndex(e => e.id === this.currentEraId);
    const nextEraIdx = (curEraIdx + 1) % this.models.HISTORICAL_ERAS.length;
    const nextEra = this.models.HISTORICAL_ERAS[nextEraIdx];
    this.selectedEraId = nextEra.id;
    this.showEraSelectModal(nextEra.id);
  }

  // ======================== 東方遊樂場大道與時空長河躍遷系統 ========================
  jumpToNextEraSpacetime(nextEraId) {
    if (this.isTransitioningEra) return;
    this.isTransitioningEra = true;

    const nextEra = this.models.HISTORICAL_ERAS.find(e => e.id === nextEraId);
    if (!nextEra) {
      this.isTransitioningEra = false;
      return;
    }

    if (window.soundFx) window.soundFx.playLevelUp();
    this.coinVFX.burst(this.hero.x - this.camera.x, this.hero.y - this.camera.y, 60);

    // 觸發全螢幕時空穿越光幕特效
    this.triggerSpacetimeWarpEffect(nextEra);

    setTimeout(() => {
      // 呼叫 resetGame，重設至下一個時代，並指定從中央起始點 (x: 700, y: 420) 進入新世界！
      this.resetGame(nextEraId, nextEra.defaultIdentityId || nextEra.perspectives[0].id, false, 'center');
      this.renderHUD();

      // 小地圖標籤更新
      const minimapOverlay = document.querySelector('.minimap-overlay');
      if (minimapOverlay && this.currentEra) {
        minimapOverlay.innerText = `📍 ${this.currentEra.title.split('・')[0].split('·')[0]}`;
      }
      const minimapYear = document.querySelector('.minimap-container .font-mono span');
      if (minimapYear && this.currentEra) {
        minimapYear.innerText = `${this.currentEra.year}`;
      }

      this.showToast(`🌌 穿越時空長河！已抵達【${this.currentEra.year} ${this.currentEra.title}】！扮演【${this.state.identityName}】（${this.state.roleTypeBadge}）`, 4500);
      this.addFloatingText(this.hero.x, this.hero.y - 60, `✨ 抵達新世界：${this.currentEra.title}`, '#38bdf8', 26);

      this.isTransitioningEra = false;
    }, 600);
  }

  jumpToPrevEraSpacetime(prevEraId) {
    if (this.isTransitioningEra) return;
    this.isTransitioningEra = true;

    const prevEra = this.models.HISTORICAL_ERAS.find(e => e.id === prevEraId);
    if (!prevEra) {
      this.isTransitioningEra = false;
      return;
    }

    if (window.soundFx) window.soundFx.playClick();
    this.coinVFX.burst(this.hero.x - this.camera.x, this.hero.y - this.camera.y, 45);

    // 觸發全螢幕時空回溯光幕特效
    this.triggerSpacetimeWarpEffect(prevEra, true);

    setTimeout(() => {
      // 依歷史回溯特性：角色切換為上一個時代最後演繹或該時代代表人物
      let targetPId = prevEra.defaultIdentityId || prevEra.perspectives[0].id;
      if (this.playerMaster && this.playerMaster.lastActivePerspectiveId && prevEra.perspectives.some(p => p.id === this.playerMaster.lastActivePerspectiveId)) {
        targetPId = this.playerMaster.lastActivePerspectiveId;
      } else if (prevEra.perspectives && prevEra.perspectives.length > 0) {
        targetPId = prevEra.perspectives[prevEra.perspectives.length - 1].id;
      }

      this.resetGame(prevEraId, targetPId, false, 'center');
      this.renderHUD();

      // 小地圖標籤更新
      const minimapOverlay = document.querySelector('.minimap-overlay');
      if (minimapOverlay && this.currentEra) {
        minimapOverlay.innerText = `📍 ${this.currentEra.title.split('・')[0].split('·')[0]}`;
      }
      const minimapYear = document.querySelector('.minimap-container .font-mono span');
      if (minimapYear && this.currentEra) {
        minimapYear.innerText = `${this.currentEra.year}`;
      }

      this.showToast(`🕰️ 時空回溯！已返回【${this.currentEra.year} ${this.currentEra.title}】！扮演【${this.state.identityName}】（${this.state.roleTypeBadge}）`, 4500);
      this.addFloatingText(this.hero.x, this.hero.y - 60, `🕰️ 角色切換：${this.state.identityName}`, '#f59e0b', 26);
      this.isTransitioningEra = false;
    }, 600);
  }

  triggerSpacetimeWarpEffect(targetEra, isRewind = false) {
    const overlay = document.getElementById('spacetime-warp-overlay');
    const title = document.getElementById('warp-era-title');
    const sub = document.getElementById('warp-era-subtitle');
    if (!overlay) return;
    if (title) {
      title.innerText = isRewind ? `🕰️ 時空歲月回溯 · 返回【${targetEra.title}】` : `🌌 跨越時空長河 · 前往【${targetEra.title}】`;
    }
    if (sub) {
      sub.innerText = isRewind ? `星軌倒轉，歲月重溫……重返 ${targetEra.year} ${targetEra.period || ''}` : `歷史長河奔流……即將進入 ${targetEra.year} ${targetEra.period || ''}`;
    }
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      overlay.classList.remove('opacity-0');
      overlay.classList.add('opacity-100');
    });
    setTimeout(() => {
      overlay.classList.remove('opacity-100');
      overlay.classList.add('opacity-0');
      setTimeout(() => overlay.classList.add('hidden'), 500);
    }, 1100);
  }

  drawPlaygroundBoulevard(ctx) {
    ctx.save();

    // ==================== 1. 東方星軌大道與中途廣場 (x: 1750, y: 420) ====================
    // 東方星盤廣場
    ctx.beginPath();
    ctx.arc(1750, 420, 95, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(1750, 420, 72, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 星盤符文
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath();
      ctx.moveTo(1750, 420);
      ctx.lineTo(1750 + Math.cos(a) * 65, 420 + Math.sin(a) * 65);
      ctx.stroke();
    }

    // 東方中央巨石日晷
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(1750, 420, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 日晷指針
    const shadowAngle = this.ambientLightTick * 0.3;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(1750, 420);
    ctx.lineTo(1750 + Math.cos(shadowAngle) * 28, 420 + Math.sin(shadowAngle) * 28);
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(1750, 420, 5, 0, Math.PI * 2);
    ctx.fill();

    // 東方北側巨石柱群 (x: 1750, y: 160)
    this.drawStonePath(ctx, 1750, 420, 1750, 180);
    const megaliths = [
      { x: 1680, y: 160, h: 42, w: 18, color: '#64748b' },
      { x: 1750, y: 130, h: 56, w: 22, color: '#94a3b8' },
      { x: 1820, y: 160, h: 40, w: 18, color: '#64748b' }
    ];
    for (const m of megaliths) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(m.x + 8, m.y + m.h / 2, m.w * 0.9, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.roundRect(m.x - m.w / 2, m.y - m.h / 2, m.w, m.h, 5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 東方南側水岸觀景棧道 (x: 1750, y: 700)
    this.drawStonePath(ctx, 1750, 420, 1750, 710);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(1700, 710, 100, 45);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.strokeRect(1700, 710, 100, 45);
    ctx.fillStyle = '#bae6fd';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔭 東方水岸眺望台', 1750, 700);

    // 東方探險營地 (x: 1450, y: 260)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(1420, 280);
    ctx.lineTo(1450, 230);
    ctx.lineTo(1480, 280);
    ctx.closePath();
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 2;
    ctx.stroke();

    const firePulse = Math.sin(this.ambientLightTick * 6) * 3;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(1505, 275, 7 + firePulse, 0, Math.PI * 2);
    ctx.fill();

    // 東方時空路標告示牌 (x: 1650, y: 375)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(1650, 375, 200, 28, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🧭 紀元星軌大道 · 前方時空渡口 ▶', 1750, 394);

    // 東方大道沿途路燈
    const eastLamps = [1350, 1550, 1750, 1850];
    for (const lx of eastLamps) {
      this.drawStreetLanternPost(ctx, lx, 360);
      this.drawStreetLanternPost(ctx, lx, 480);
    }

    // ==================== 2. 西方星軌大道與中途廣場 (移至 x: -400, y: 420，徹底遠離城鎮工棚) ====================
    // 西方星盤廣場
    ctx.beginPath();
    ctx.arc(-400, 420, 85, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-400, 420, 65, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.4)';
    ctx.setLineDash([6, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 西方中央紀元日晷
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(-400, 420, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#e9d5ff';
    ctx.beginPath();
    ctx.arc(-400, 420, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 西方北側星柱群 (x: -400, y: 160)
    this.drawStonePath(ctx, -400, 420, -400, 180);
    const westMegaliths = [
      { x: -450, y: 160, h: 42, w: 18, color: '#64748b' },
      { x: -400, y: 130, h: 54, w: 22, color: '#94a3b8' },
      { x: -350, y: 160, h: 40, w: 18, color: '#64748b' }
    ];
    for (const m of westMegaliths) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(m.x + 6, m.y + m.h / 2, m.w * 0.9, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.roundRect(m.x - m.w / 2, m.y - m.h / 2, m.w, m.h, 5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 西方南側水岸觀景棧道 (x: -400, y: 700)
    this.drawStonePath(ctx, -400, 420, -400, 710);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-450, 710, 100, 45);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.strokeRect(-450, 710, 100, 45);
    ctx.fillStyle = '#e0e7ff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔭 西方水岸眺望台', -400, 700);

    // 西方探險營地 (x: -260, y: 260)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(-290, 280);
    ctx.lineTo(-260, 230);
    ctx.lineTo(-230, 280);
    ctx.closePath();
    ctx.fillStyle = '#7c3aed';
    ctx.fill();
    ctx.strokeStyle = '#c4b5fd';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(-215, 275, 6 + firePulse, 0, Math.PI * 2);
    ctx.fill();

    // 西方時空路標告示牌 (x: -500, y: 375，中心在 -400, 394)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-500, 375, 200, 28, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e9d5ff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('◀ 前方時空渡口 · 紀元星軌大道 🧭', -400, 394);

    // 西方大道沿途路燈 (自城鎮西緣 -100 延伸至渡口 -550)
    const westLamps = [-100, -250, -400, -550];
    for (const lx of westLamps) {
      this.drawStreetLanternPost(ctx, lx, 360);
      this.drawStreetLanternPost(ctx, lx, 480);
    }

    ctx.restore();
  }

  drawSpacetimePortals(ctx) {
    const curEraIdx = this.models.HISTORICAL_ERAS.findIndex(e => e.id === this.currentEraId);
    const nextEraIdx = curEraIdx !== -1 ? (curEraIdx + 1) % this.models.HISTORICAL_ERAS.length : 0;
    const nextEra = this.models.HISTORICAL_ERAS[nextEraIdx];
    const isNextUnlocked = this.isCurrentEraCompleted() && !this.hasActiveQuest();

    ctx.save();

    // ==================== 1. 東方時空長河躍遷渡口 (x: 1880, y: 420) 與封印壁障 ====================
    if (nextEra) {
      const pX = 1880;
      const pY = 420;

      // 若尚未破關：繪製垂直貫通天地 (x: 1840) 的「時空封印壁障能量結界」
      if (!isNextUnlocked) {
        const barrierX = 1840;
        const bPulse = Math.sin(this.ambientLightTick * 4) * 0.12;

        // 1. 全地圖垂直光幕 (遮蔽東方時空)
        const wallGrad = ctx.createLinearGradient(barrierX - 25, 0, barrierX + 60, 0);
        wallGrad.addColorStop(0, 'rgba(244, 63, 94, 0)');
        wallGrad.addColorStop(0.35, `rgba(225, 29, 72, ${0.28 + bPulse})`);
        wallGrad.addColorStop(0.65, `rgba(190, 18, 60, ${0.45 + bPulse})`);
        wallGrad.addColorStop(1, 'rgba(15, 23, 42, 0.7)');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(barrierX - 20, -200, 360, this.worldHeight + 400);

        // 2. 封印雷射邊界光軸
        ctx.save();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(barrierX, -100);
        ctx.lineTo(barrierX, this.worldHeight + 200);
        ctx.stroke();

        // 3. 封印力場菱形符文網
        ctx.strokeStyle = 'rgba(251, 113, 133, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([12, 12]);
        ctx.beginPath();
        ctx.moveTo(barrierX + 15, -100);
        ctx.lineTo(barrierX + 15, this.worldHeight + 200);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // 4. 壁障中央巨型封印符文徽記 (x: 1840, y: 420)
        ctx.save();
        ctx.beginPath();
        ctx.arc(barrierX, 420, 38, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fill();
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', barrierX, 420);
        ctx.restore();
      }

      // 地面時空引力光環
      const pulse = Math.sin(this.ambientLightTick * 3) * 6;
      ctx.beginPath();
      ctx.arc(pX, pY, 70 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = isNextUnlocked ? 'rgba(168, 85, 247, 0.18)' : 'rgba(225, 29, 72, 0.08)';
      ctx.fill();
      ctx.strokeStyle = isNextUnlocked ? '#38bdf8' : '#e11d48';
      ctx.lineWidth = isNextUnlocked ? 3 : 2;
      ctx.stroke();

      // 旋轉符文內圈
      ctx.save();
      ctx.translate(pX, pY);
      ctx.rotate(this.ambientLightTick * (isNextUnlocked ? 1.2 : 0.4));
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.strokeStyle = isNextUnlocked ? '#facc15' : '#fda4af';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 8]);
      ctx.stroke();
      ctx.restore();

      // 傳送門門柱 (雙座紀元方尖碑)
      const pillarW = 26;
      const pillarH = 140;
      const pillarOffset = 65;

      for (const side of [-1, 1]) {
        const pilX = pX + side * pillarOffset;
        const pilY = pY - pillarH / 2;

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = isNextUnlocked ? '#c084fc' : '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(pilX - pillarW / 2, pilY, pillarW, pillarH, 7);
        ctx.fill();
        ctx.stroke();

        // 柱身充能導光槽
        const flowY = pilY + (Math.sin(this.ambientLightTick * 4 + side) * 0.5 + 0.5) * (pillarH - 20);
        ctx.fillStyle = isNextUnlocked ? '#38bdf8' : '#fda4af';
        ctx.beginPath();
        ctx.arc(pilX, flowY + 10, 4, 0, Math.PI * 2);
        ctx.fill();

        // 柱頂能量浮石
        const floatY = pilY - 14 + Math.sin(this.ambientLightTick * 3 + side) * 4;
        ctx.fillStyle = isNextUnlocked ? '#facc15' : '#ef4444';
        ctx.beginPath();
        ctx.arc(pilX, floatY, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // 門扉中央時空漩渦
      if (isNextUnlocked) {
        const vortexGrad = ctx.createRadialGradient(pX, pY, 5, pX, pY, 55);
        vortexGrad.addColorStop(0, '#ffffff');
        vortexGrad.addColorStop(0.3, '#38bdf8');
        vortexGrad.addColorStop(0.7, '#8b5cf6');
        vortexGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = vortexGrad;
        ctx.beginPath();
        ctx.ellipse(pX, pY, 45, 60, 0, 0, Math.PI * 2);
        ctx.fill();

        // 核心躍遷奇異點
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pX, pY, 8 + Math.sin(this.ambientLightTick * 6) * 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(225, 29, 72, 0.25)';
        ctx.beginPath();
        ctx.ellipse(pX, pY, 45, 60, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', pX, pY);
      }

      // 懸浮告示大牌匾
      const bannerY = pY - 95;
      const bannerW = 290;
      const bannerH = 46;

      ctx.fillStyle = '#0b1120';
      ctx.strokeStyle = isNextUnlocked ? '#a855f7' : '#e11d48';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(pX - bannerW / 2, bannerY, bannerW, bannerH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      if (isNextUnlocked) {
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 15px "Noto Serif TC", serif';
        ctx.fillText(`🌌 跨越時空 ▶ 前往【${nextEra.title}】`, pX, bannerY + 18);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('✨ 已通關！一直往右走即可跨入下一時代', pX, bannerY + 36);
      } else {
        const curEraPerspectives = this.currentEra ? (this.currentEra.perspectives || []) : [];
        const totalCount = curEraPerspectives.length;
        const doneCount = curEraPerspectives.filter(p => this.playerMaster && this.playerMaster.completedPerspectives && this.playerMaster.completedPerspectives.includes(p.id)).length;
        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 14px "Noto Serif TC", serif';
        ctx.fillText(`🔒 時空界線封印 · 前方【${nextEra.title}】`, pX, bannerY + 18);
        ctx.fillStyle = '#fda4af';
        ctx.font = 'bold 11px sans-serif';
        if (this.hasActiveQuest()) {
          ctx.fillText('需先完成當前角色歷史抉擇任務，方可通行', pX, bannerY + 36);
        } else {
          ctx.fillText(`需通關本篇章全部角色 (${doneCount}/${totalCount})，方可通行`, pX, bannerY + 36);
        }
      }
    }

    // ==================== 2. 西方時空回溯/漫遊渡口 (移至 x: -650, y: 420) ====================
    const prevEraIdx = curEraIdx > 0 ? curEraIdx - 1 : this.models.HISTORICAL_ERAS.length - 1;
    const prevEra = this.models.HISTORICAL_ERAS[prevEraIdx];
    if (prevEra) {
      const pX = -650;
      const pY = 420;

      // 地面時空引力光環
      const pulse = Math.sin(this.ambientLightTick * 2.8) * 5;
      ctx.beginPath();
      ctx.arc(pX, pY, 65 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(147, 51, 234, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 旋轉符文內圈
      ctx.save();
      ctx.translate(pX, pY);
      ctx.rotate(-this.ambientLightTick * 0.8);
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([7, 7]);
      ctx.stroke();
      ctx.restore();

      // 雙座方尖碑
      const pillarW = 24;
      const pillarH = 130;
      const pillarOffset = 60;
      for (const side of [-1, 1]) {
        const pilX = pX + side * pillarOffset;
        const pilY = pY - pillarH / 2;

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(pilX - pillarW / 2, pilY, pillarW, pillarH, 6);
        ctx.fill();
        ctx.stroke();

        // 浮石
        const floatY = pilY - 12 + Math.sin(this.ambientLightTick * 3 - side) * 4;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(pilX, floatY, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      // 中央時空漩渦
      const vortexGrad = ctx.createRadialGradient(pX, pY, 4, pX, pY, 50);
      vortexGrad.addColorStop(0, '#ffffff');
      vortexGrad.addColorStop(0.3, '#c084fc');
      vortexGrad.addColorStop(0.7, '#38bdf8');
      vortexGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = vortexGrad;
      ctx.beginPath();
      ctx.ellipse(pX, pY, 40, 55, 0, 0, Math.PI * 2);
      ctx.fill();

      // 懸浮告示牌匾
      const bannerY = pY - 90;
      const bannerW = 270;
      const bannerH = 44;

      ctx.fillStyle = '#0b1120';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(pX - bannerW / 2, bannerY, bannerW, bannerH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fed7aa';
      ctx.font = 'bold 14px "Noto Serif TC", serif';
      ctx.fillText(`🕰️ 跨越時空 ◀ 前往【${prevEra.title}】`, pX, bannerY + 17);
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('✨ 一直往左走即可跨入此歷史時代', pX, bannerY + 34);
    }

    ctx.restore();
  }
}

// 實例化掛載至全域
window.game = new GameController();
window.addEventListener('DOMContentLoaded', () => {
  window.game.init();
});
