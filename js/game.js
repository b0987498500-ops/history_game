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

    // 地圖與世界邊界
    this.worldWidth = 1400;
    this.worldHeight = 1000;
    this.camera = { x: 0, y: 0 };

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

    // 每秒更新戰局時間
    setInterval(() => this.updateGameTimer(), 1000);
  }

  initEnvironmentAndNPCs() {
    // 1. 初始化主角清代長辮物理骨節 (6 節鏈狀物理)
    this.hero.queueJoints = [];
    for (let i = 0; i < 6; i++) {
      this.hero.queueJoints.push({ x: this.hero.x, y: this.hero.y + i * 5 });
    }

    // 2. 時代市井 NPC 群像 (合理安全間距，杜絕字體與人物重疊)
    this.npcs = [
      {
        id: 'npc_coolie',
        name: '挑茶苦力 · 阿福',
        role: '碼頭挑夫',
        x: 340,
        y: 420,
        baseX: 340,
        baseY: 420,
        type: 'coolie',
        facing: 1,
        talk: '深坑的烏龍茶剛送到！得趕緊挑去寶順洋行秤重裝箱！'
      },
      {
        id: 'npc_dodd',
        name: '約翰·陶德 (Dodd)',
        role: '洋商創始人',
        x: 825,
        y: 175,
        baseX: 825,
        baseY: 175,
        type: 'westerner',
        facing: -1,
        talk: 'Formosa Oolong tea will conquer New York and London!'
      },
      {
        id: 'npc_comprador',
        name: '買辦 · 李春生',
        role: '茶業買辦',
        x: 615,
        y: 175,
        baseX: 615,
        baseY: 175,
        type: 'scholar',
        facing: 1,
        talk: '承恩，開港乃百年難遇之良機，與洋行聯手方能將臺灣茶推向海外！'
      },
      {
        id: 'npc_apprentice',
        name: '行郊學徒 · 阿木',
        role: '糖郊夥計',
        x: 265,
        y: 175,
        baseX: 265,
        baseY: 175,
        type: 'apprentice',
        facing: -1,
        talk: '掌櫃說過，近來兩岸商路風浪大，郊商銀錢吃緊，還是守成穩健好。'
      },
      {
        id: 'npc_guard',
        name: '正關巡勇 · 杜把總',
        role: '淡水正關巡防',
        x: 645,
        y: 410,
        baseX: 645,
        baseY: 410,
        type: 'guard',
        facing: -1,
        talk: '海關正嚴查無稅私運！膽敢闖入西南私渡口，定依新關章程究辦！'
      },
      {
        id: 'npc_boatman',
        name: '渡船船伕 · 林老漢',
        role: '淡水河擺渡',
        x: 490,
        y: 530,
        baseX: 490,
        baseY: 530,
        type: 'boatman',
        facing: 1,
        talk: '潮水正旺，來往艋舺與滬尾的行商舢舨隨時可渡！'
      }
    ];

    // 3. 環境氛圍飄浮粒子 (茶葉微粒、燈籠光星、水霧)
    this.ambientParticles = [];
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
        type: Math.random() < 0.65 ? 'tealeaf' : 'spark'
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

  resetGame() {
    const defaultIdentity = this.models.GAME_IDENTITIES[0];
    this.state = {
      identityId: defaultIdentity.id,
      identityName: defaultIdentity.name,
      identityTitle: defaultIdentity.title,
      silver: defaultIdentity.initialSilver,
      reputation: defaultIdentity.initialReputation,
      knowledge: defaultIdentity.initialKnowledge,
      tierLevel: 1,
      homeLevel: 1,
      currentOutfit: 'outfit_peasant',
      unlockedOutfits: ['outfit_peasant'],
      accumulatedRent: 0,
      rentTimer: 0,
      unlockedClues: [],
      inventoryCollectibles: [],
      currentNodeId: 'node_open_market',
      choiceHistory: [],
      historicalDecisionsCount: 0
    };
    // 英雄生成於中央開市廣場
    this.hero.x = 490;
    this.hero.y = 260;
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

    // 家宅商號店租分紅累積 (每 25 秒產出一次)
    if (this.state && this.state.homeLevel > 1) {
      this.state.rentTimer = (this.state.rentTimer || 0) + 1 / 60;
      if (this.state.rentTimer >= 25) {
        this.state.rentTimer = 0;
        const currentTier = this.models.HOME_TIERS[this.state.homeLevel - 1];
        if (currentTier && currentTier.rentPerInterval > 0) {
          this.state.accumulatedRent = (this.state.accumulatedRent || 0) + currentTier.rentPerInterval;
          this.showToast(`💰 承恩宅邸鋪面產生了 ${currentTier.rentPerInterval} 兩店租分紅，可隨時回家領取！`);
          const rentDisplay = document.getElementById('home-accumulated-rent');
          if (rentDisplay) rentDisplay.innerText = `${this.state.accumulatedRent} 兩`;
        }
      }
    }

    // 2. 角色移動計算 (鍵盤與虛擬搖桿融合)
    let moveX = 0;
    let moveY = 0;

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

    // 限制在世界邊界內
    this.hero.x = Math.max(50, Math.min(this.worldWidth - 50, this.hero.x));
    this.hero.y = Math.max(50, Math.min(this.worldHeight - 50, this.hero.y));

    // 殘影衰減
    for (let i = this.hero.ghostTrails.length - 1; i >= 0; i--) {
      this.hero.ghostTrails[i].alpha -= 0.04;
      if (this.hero.ghostTrails[i].alpha <= 0) {
        this.hero.ghostTrails.splice(i, 1);
      }
    }

    // 3. 相機跟隨英雄平滑移動 (以 CSS 視口中心為基準)
    const vW = this.viewWidth || window.innerWidth;
    const vH = this.viewHeight || window.innerHeight;
    const targetCamX = this.hero.x - vW / 2;
    const targetCamY = this.hero.y - vH / 2;
    this.camera.x += (targetCamX - this.camera.x) * 0.1;
    this.camera.y += (targetCamY - this.camera.y) * 0.1;

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
    const currentNode = this.models.EVENT_NODES[this.state.currentNodeId];
    if (!currentNode) return;

    let nearestZone = null;
    let minDistance = 90; // 觸發半徑

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

    // 狀態轉移與懸浮卡更新 (修正：僅在接觸區域改變時更新 DOM，避免每幀重繪導致點擊事件失效)
    if (nearestZone) {
      const zoneKey = nearestZone.isPlayerHome ? 'home' : (nearestZone.isDockMinigame ? 'dock' : `${nearestZone.location.id}_${nearestZone.optionIndex}`);
      if (this.currentZoneKey !== zoneKey) {
        this.currentZoneKey = zoneKey;
        this.currentContactZone = nearestZone;
        this.showZonePromptBubble(nearestZone);
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

    if (zone.isPlayerHome) {
      const homeTier = this.models.HOME_TIERS[this.state.homeLevel - 1] || this.models.HOME_TIERS[0];
      document.getElementById('bubble-icon').innerText = '🏡';
      document.getElementById('bubble-loc-name').innerText = '大稻埕 · 承恩商邸';
      document.getElementById('bubble-subtitle').innerText = `自家產業 · ${homeTier.name}`;
      document.getElementById('bubble-badge').innerText = '🏡 自家私宅';
      document.getElementById('bubble-decision-text').innerText = '進入自家商邸：擴建豪宅、更換衣服造型、坐收商號租金！';
      document.getElementById('bubble-cost').innerText = '0 兩';
      document.getElementById('bubble-reward').innerText = `${this.state.accumulatedRent || 0} 兩待領`;
      document.getElementById('bubble-crit').innerText = `Lv.${this.state.homeLevel}`;

      if (confirmBtn) {
        confirmBtn.innerHTML = '<span class="text-xl">🏡</span><span>進入自家宅邸（點擊或按空白鍵）</span>';
        confirmBtn.className = 'flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-lg sm:text-xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer';
      }
    } else if (zone.isDockMinigame) {
      document.getElementById('bubble-icon').innerText = '⚓';
      document.getElementById('bubble-loc-name').innerText = '大稻埕碼頭棧房';
      document.getElementById('bubble-subtitle').innerText = '碼頭理貨 · 現賺銀兩與秘笈';
      document.getElementById('bubble-badge').innerText = '⚓ 打工賺錢';
      document.getElementById('bubble-decision-text').innerText = '幫碼頭理貨打工，點選 3 箱商貨，現賺 30 兩並拿行商秘笈！';
      document.getElementById('bubble-cost').innerText = '0 兩';
      document.getElementById('bubble-reward').innerText = '30 兩+情報';
      document.getElementById('bubble-crit').innerText = '100%';

      if (confirmBtn) {
        confirmBtn.innerHTML = '<span class="text-xl">⚓</span><span>開始理貨打工（點擊或按空白鍵）</span>';
        confirmBtn.className = 'flex-1 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-black text-lg sm:text-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer';
      }
    } else {
      const opt = zone.option;
      const loc = zone.location;
      document.getElementById('bubble-icon').innerText = loc.icon;
      document.getElementById('bubble-loc-name').innerText = loc.name;
      document.getElementById('bubble-subtitle').innerText = loc.subTitle;
      document.getElementById('bubble-badge').innerText = opt.badge || '商業決策';
      document.getElementById('bubble-decision-text').innerText = opt.text;
      document.getElementById('bubble-cost').innerText = `${opt.baseCost} 兩`;
      document.getElementById('bubble-reward').innerText = `${opt.baseSilverReward} 兩`;
      document.getElementById('bubble-crit').innerText = `${Math.round(opt.criticalChance * 100)}%`;

      if (confirmBtn) {
        if (this.state.silver < opt.baseCost) {
          const shortage = opt.baseCost - this.state.silver;
          confirmBtn.innerHTML = `<span>⚠️</span><span>本金不足（尚缺 ${shortage} 兩）· 點此自動前往碼頭打工</span>`;
          confirmBtn.className = 'flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-700 to-red-700 hover:from-amber-600 hover:to-red-600 text-amber-200 font-black text-base sm:text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 animate-pulse cursor-pointer';
        } else {
          confirmBtn.innerHTML = '<span class="text-xl">🤝</span><span>確認商號交涉（點擊或按空白鍵）</span>';
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
    // 高亮普攻按鍵
    const btn = document.getElementById('btn-interact');
    if (btn) btn.classList.add('pressed');
  }

  hideZonePromptBubble() {
    this.currentZoneKey = null;
    const bubble = document.getElementById('zone-prompt-bubble');
    if (bubble) bubble.classList.add('hidden');
    const btn = document.getElementById('btn-interact');
    if (btn) btn.classList.remove('pressed');
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
    // 基底土地顏色 (晚清大稻埕老街沉穩青石鋪地)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.worldWidth, this.worldHeight);

    // 鋪設細緻微石磚地紋 (止於淡水河岸線 y: 480)
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
    ctx.lineWidth = 1;
    const tSize = 48;
    for (let x = 0; x < this.worldWidth; x += tSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 480);
      ctx.stroke();
    }
    for (let y = 0; y < 480; y += tSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.worldWidth, y);
      ctx.stroke();
    }

    // 街道沿線八角宮廷石雕風燈 (溫潤暖光輻射光暈)
    this.drawStreetLanternPost(ctx, 350, 160);
    this.drawStreetLanternPost(ctx, 620, 160);
    this.drawStreetLanternPost(ctx, 620, 360);
    this.drawStreetLanternPost(ctx, 350, 360);

    // 繪製泉州花崗石板大道 (壓艙石鋪砌的主街道)
    this.drawStonePath(ctx, 485, 260, 485, 460); // 南北大街 (連接碼頭與中央廣場)
    this.drawStonePath(ctx, 210, 150, 485, 260); // 西北街 (通往泉郊金聯成)
    this.drawStonePath(ctx, 485, 260, 750, 150); // 東北街 (通往英商寶順洋行)
    this.drawStonePath(ctx, 485, 260, 750, 370); // 東南街 (通往淡水海關)
    this.drawDirtPath(ctx, 485, 260, 200, 370);  // 西南暗巷泥徑 (通往𧶄瑯私渡口)

    // 中央開市青石廣場 (石龍祥雲紋鋪面)
    ctx.save();
    ctx.beginPath();
    ctx.arc(485, 260, 110, 0, Math.PI * 2);
    ctx.fillStyle = '#192338';
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 廣場內圈花崗岩石環
    ctx.beginPath();
    ctx.arc(485, 260, 82, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.setLineDash([10, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 廣場中央吉祥如意回紋印記
    ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
    ctx.beginPath();
    ctx.arc(485, 260, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 廣場四角石雕風燈
    const angles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
    for (const ang of angles) {
      const lx = 485 + Math.cos(ang) * 100;
      const ly = 260 + Math.sin(ang) * 100;
      // 燈光光暈
      const radGrad = ctx.createRadialGradient(lx, ly, 2, lx, ly, 32);
      radGrad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
      radGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(lx, ly, 32, 0, Math.PI * 2);
      ctx.fill();

      // 石燈座
      ctx.fillStyle = '#475569';
      ctx.fillRect(lx - 7, ly - 7, 14, 14);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(lx - 4, ly - 4, 8, 8);
    }
    ctx.restore();

    // ================== 淡水河水文與港灣水景 (前移立體可見) ==================
    const riverStartY = 480;
    const waterGrad = ctx.createLinearGradient(0, riverStartY, 0, this.worldHeight);
    waterGrad.addColorStop(0, '#0c2844');
    waterGrad.addColorStop(0.2, '#075985');
    waterGrad.addColorStop(0.65, '#0369a1');
    waterGrad.addColorStop(1, '#0284c7');

    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, riverStartY, this.worldWidth, this.worldHeight - riverStartY);

    // 河岸石砌防潮坡堤
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, riverStartY - 8, this.worldWidth, 10);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, riverStartY - 8, this.worldWidth, 10);

    // 水波粼粼波紋 (隨時間流動動態渲染)
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.28)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      const wy = riverStartY + 20 + i * 32;
      const waveShift = Math.sin(this.ambientLightTick * 1.5 + i * 0.8) * 35;
      ctx.beginPath();
      ctx.moveTo(0, wy);
      ctx.bezierCurveTo(380 + waveShift, wy - 12, 750 - waveShift, wy + 12, 1100 + waveShift, wy - 6);
      ctx.lineTo(this.worldWidth, wy);
      ctx.stroke();
    }

    // 停泊的清代戎克帆船 (Junk boat at x: 200, y: 570)
    this.drawChineseJunk(ctx, 200, 570);

    // 停泊的開港外商三桅輪船 (Western trade ship at x: 780, y: 580)
    this.drawWesternShip(ctx, 780, 580);

    // 碼頭大木棧橋 (Dock Boardwalk at x: 390..580, y: 440..580)
    this.drawDockPier(ctx);

    // 大稻埕老榕樹 (百年老樹遮蔭街角)
    this.drawBanyanTree(ctx, 290, 200, 48);
    this.drawBanyanTree(ctx, 660, 210, 50);

    // 街邊曬茶竹篩 (Outside 寶順洋行)
    this.drawTeaTrays(ctx, 780, 205);
    this.drawTeaTrays(ctx, 780, 245);

    // 市井生活場景 (奉茶棚、南北貨攤、運茶木板推車、茉莉陶盆)
    this.drawTeaStall(ctx, 345, 255);
    this.drawGoodsStall(ctx, 625, 255);
    this.drawPushcart(ctx, 410, 310);
    this.drawJasminePot(ctx, 420, 210);
    this.drawJasminePot(ctx, 550, 210);
    this.drawJasminePot(ctx, 420, 305);
    this.drawJasminePot(ctx, 550, 305);
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
    const px = 390;
    const py = 440;
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

  // 2. 繪製環境飄浮粒子 (Tea Leaves, Sparks & Seagulls)
  drawAmbientParticles(ctx) {
    // 飄落茶葉與燈花
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
      const isRecommended = opt && opt.requiredClues.length > 0 && opt.requiredClues.every(cid => this.state.unlockedClues.includes(cid));

      ctx.save();

      // 1. 地面發光法陣 (Ground Interactivity Circle)
      const ringColor = isRecommended ? '#f59e0b' : (opt ? loc.themeColor : '#64748b');
      const pulse = Math.sin(this.ambientLightTick * 2.5) * 5;

      ctx.beginPath();
      ctx.arc(loc.doorX, loc.doorY, 52 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = isRecommended ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.1)';
      ctx.fill();
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = isRecommended ? 3.5 : 2;
      ctx.stroke();

      // 內圈八卦/商行刻度
      ctx.beginPath();
      ctx.arc(loc.doorX, loc.doorY, 34, 0, Math.PI * 2);
      ctx.strokeStyle = ringColor;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. 特色時代立體建築本體繪製
      if (loc.id === 'loc_player_home') {
        this.drawBuildingPlayerHome(ctx, loc, ringColor);
      } else if (loc.id === 'loc_sugar_guild') {
        this.drawBuildingFujianGuild(ctx, loc, ringColor);
      } else if (loc.id === 'loc_tea_firm') {
        this.drawBuildingWesternArcade(ctx, loc, ringColor);
      } else if (loc.id === 'loc_customs') {
        this.drawBuildingCustomsGate(ctx, loc, ringColor);
      } else if (loc.id === 'loc_dock') {
        this.drawBuildingDockWarehouse(ctx, loc, ringColor);
      } else {
        this.drawBuildingSmugglerShack(ctx, loc, ringColor);
      }

      // 3. 【古風門額木匾】(商號名稱，固定於屋簷上方，清晰黑漆金字)
      const plaqueY = loc.y - 18;
      const plaqueW = 164;
      const plaqueH = 26;

      ctx.fillStyle = '#1c0f08'; // 仿紅木黑漆
      ctx.strokeStyle = loc.id === 'loc_player_home' ? '#4ade80' : '#ca8a04'; // 鎏金包邊
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.roundRect(loc.x + loc.width / 2 - plaqueW / 2, plaqueY, plaqueW, plaqueH, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = loc.id === 'loc_player_home' ? '#86efac' : '#fef08a';
      ctx.font = 'bold 14px "Noto Serif TC", "Songti TC", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.fillText(loc.banner, loc.x + loc.width / 2, plaqueY + plaqueH / 2);
      ctx.shadowBlur = 0;

      // 4. 【當前歷史任務標籤】(高架於建築上空，縱向空間獨立，絕不與門額重疊！)
      if (opt || loc.id === 'loc_dock' || loc.id === 'loc_player_home') {
        const floatY = loc.y - 52 + Math.sin(this.ambientLightTick * 3 + loc.doorX) * 3;
        const badgeW = 172;
        const badgeH = 25;

        let badgeBg = 'rgba(30, 41, 59, 0.95)';
        let badgeBorder = '#38bdf8';
        let badgeText = opt ? (opt.badge || '💡 歷史抉擇') : '⚓ 碼頭理貨打工';
        let badgeTextColor = '#f8fafc';

        if (loc.id === 'loc_player_home') {
          badgeBg = 'rgba(15, 60, 35, 0.96)';
          badgeBorder = '#4ade80';
          badgeText = `🏡 承恩宅邸 · Lv.${this.state.homeLevel} (換裝/收租)`;
          badgeTextColor = '#fef08a';
        } else if (isRecommended) {
          badgeBg = 'rgba(245, 158, 11, 0.98)';
          badgeBorder = '#fef08a';
          badgeText = '★ 秘笈首選 · 暴擊利潤';
          badgeTextColor = '#000000';
        } else if (loc.id === 'loc_smuggler') {
          badgeBg = 'rgba(220, 38, 38, 0.95)';
          badgeBorder = '#fca5a5';
          badgeText = '⚠️ 官府嚴查 · 走私暴利';
          badgeTextColor = '#ffffff';
        } else if (loc.id === 'loc_dock') {
          badgeBg = 'rgba(2, 132, 199, 0.95)';
          badgeBorder = '#7dd3fc';
          badgeText = '⚓ 碼頭打工 · 探聽商情';
          badgeTextColor = '#ffffff';
        }

        ctx.fillStyle = badgeBg;
        ctx.strokeStyle = badgeBorder;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(loc.x + loc.width / 2 - badgeW / 2, floatY, badgeW, badgeH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = badgeTextColor;
        ctx.font = 'bold 12px "Noto Sans TC", sans-serif';
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

  // 5. 繪製導引雷達金色路徑 (Golden Guide Beam)
  drawRadarPath(ctx) {
    if (this.activeRadarBeam <= 0) return;

    const currentNode = this.models.EVENT_NODES[this.state.currentNodeId];
    if (!currentNode) return;

    let targetLoc = null;
    const recOpt = currentNode.options.find(o => o.isHistorical);
    if (recOpt) {
      targetLoc = this.models.MAP_LOCATIONS.find(l => l.id === recOpt.targetLocationId);
    }
    if (!targetLoc) return;

    ctx.save();
    const grad = ctx.createLinearGradient(this.hero.x, this.hero.y, targetLoc.doorX, targetLoc.doorY);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
    grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.9)');
    grad.addColorStop(1, 'rgba(234, 179, 8, 1.0)');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 5;
    ctx.setLineDash([12, 10]);
    ctx.lineDashOffset = -this.ambientLightTick * 20;

    ctx.beginPath();
    ctx.moveTo(this.hero.x, this.hero.y);
    ctx.lineTo(targetLoc.doorX, targetLoc.doorY);
    ctx.stroke();

    // 箭頭
    const angle = Math.atan2(targetLoc.doorY - this.hero.y, targetLoc.doorX - this.hero.x);
    ctx.translate(targetLoc.doorX, targetLoc.doorY);
    ctx.rotate(angle);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-20, -10);
    ctx.lineTo(-20, 10);
    ctx.closePath();
    ctx.fill();
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

    if (outfitId === 'outfit_peasant') {
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

    // 清代半剃半留乾淨髮際線 (Shaved Forehead to Black Hair)
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(0, faceY, 12, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();

    // 兩側英挺鬢角
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-12, faceY - 4, 2.5, 8);
    ctx.fillRect(9.5, faceY - 4, 2.5, 8);

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

    // 縮放比例
    const scaleX = mw / this.worldWidth;
    const scaleY = mh / this.worldHeight;

    // 地圖底色
    mctx.fillStyle = '#0b1120';
    mctx.fillRect(0, 0, mw, mh);

    // 淡水河水道
    mctx.fillStyle = '#0284c7';
    mctx.fillRect(0, 640 * scaleY, mw, (this.worldHeight - 640) * scaleY);

    // 木棧橋
    mctx.fillStyle = '#78350f';
    mctx.fillRect(410 * scaleX, 560 * scaleY, 180 * scaleX, 150 * scaleY);

    // 標註各大商行與地標
    const currentNode = this.models.EVENT_NODES[this.state.currentNodeId];
    for (const loc of this.models.MAP_LOCATIONS) {
      const opt = currentNode ? currentNode.options.find(o => o.targetLocationId === loc.id) : null;
      const isTarget = !!opt || loc.id === 'loc_dock';

      mctx.fillStyle = isTarget ? (loc.themeColor || '#f59e0b') : '#475569';
      mctx.beginPath();
      mctx.arc(loc.doorX * scaleX, loc.doorY * scaleY, isTarget ? 4.5 : 2.5, 0, Math.PI * 2);
      mctx.fill();
    }

    // 標註英雄自身 (亮綠金光圓點)
    mctx.fillStyle = '#22c55e';
    mctx.beginPath();
    mctx.arc(this.hero.x * scaleX, this.hero.y * scaleY, 4.5, 0, Math.PI * 2);
    mctx.fill();
    mctx.strokeStyle = '#ffffff';
    mctx.lineWidth = 1.5;
    mctx.stroke();

    // 視角雷達錐
    mctx.save();
    mctx.translate(this.hero.x * scaleX, this.hero.y * scaleY);
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

      // 快捷鍵映射
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.handlePrimaryAction();
      } else if (e.code === 'KeyJ') {
        this.castSkill('sprint');
      } else if (e.code === 'KeyK') {
        this.castSkill('radar');
      } else if (e.code === 'KeyL') {
        this.startDockMinigame();
      } else if (e.code === 'KeyB') {
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
    const clampedX = Math.max(50, Math.min(this.worldWidth - 50, x));
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

  autoNavigateToCurrentQuest() {
    const currentNode = this.models.EVENT_NODES[this.state.currentNodeId];
    if (!currentNode) return;

    let targetLoc = null;
    const recOpt = currentNode.options.find(o => o.isHistorical) || currentNode.options[0];
    if (recOpt) {
      targetLoc = this.models.MAP_LOCATIONS.find(l => l.id === recOpt.targetLocationId);
    }
    if (!targetLoc) targetLoc = this.models.MAP_LOCATIONS[0];

    this.setNavTarget(targetLoc.doorX, targetLoc.doorY, targetLoc.name);
    this.showToast(`🧭 自動尋路中：前往【${targetLoc.name}】做出歷史抉擇`);
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
      this.skillCooldowns.sprint = 4.0;
      this.hero.sprintTimer = 2.5; // 2.5 秒加速衝刺
      if (window.soundFx) window.soundFx.playCritical();
      this.addFloatingText(this.hero.x, this.hero.y - 35, '⚡ 疾跑衝刺！', '#38bdf8', 16);
    } else if (skillName === 'radar') {
      if (this.skillCooldowns.radar > 0) return;
      this.skillCooldowns.radar = 6.0;
      this.activeRadarBeam = 4.0; // 4 秒金色導引路徑
      if (window.soundFx) window.soundFx.playLevelUp();
      this.addFloatingText(this.hero.x, this.hero.y - 35, '📜 秘笈導航開啟！', '#facc15', 16);
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
      this.addFloatingText(this.hero.x, this.hero.y - 35, '🏡 返回承恩宅邸', '#22c55e', 18);
      this.showToast('🏡 已順利返回自家承恩宅邸！');
      setTimeout(() => this.showHomeModal(), 400);
    }
  }

  // ======================== 歷史商業決策核心 ========================
  chooseOption(optionIndex) {
    const node = this.models.EVENT_NODES[this.state.currentNodeId];
    if (!node) return;
    const option = node.options[optionIndex];
    if (!option) return;

    // 檢查本金 (無阻塞友善引導，避免醜陋 alert)
    if (this.state.silver < option.baseCost) {
      const shortage = option.baseCost - this.state.silver;
      this.showToast(`⚠️ 本金不足！尚缺 ${shortage} 兩，已為您自動導航至碼頭打工`);
      this.addFloatingText(this.hero.x, this.hero.y - 45, `本金不足！尚缺 ${shortage} 兩`, '#f87171', 20);
      this.autoNavigateToLocation('loc_dock');
      this.hideZonePromptBubble();
      return;
    }

    this.hideZonePromptBubble();

    // 扣除本金
    this.state.silver -= option.baseCost;

    // 走錯路致死判定 (私渡暗巷)
    if (option.isFatalDeath) {
      if (window.soundFx) window.soundFx.playCritical();
      this.addFloatingText(this.hero.x, this.hero.y - 50, '☠️ 遭遇黑吃黑與水師查緝！', '#ef4444', 22);
      this.showConsequenceModal(option, 0, false, '致命走私');
      return;
    }

    // 計算暴擊率
    let critRate = option.criticalChance;
    if (this.state.inventoryCollectibles.includes('relic_formosa_tea_box')) {
      critRate += 0.10;
    }

    const isCrit = Math.random() < critRate;
    let profit = option.baseSilverReward;
    let multiplierText = '標準結算';

    if (isCrit) {
      profit = Math.round(option.baseSilverReward * option.criticalMultiplier);
      multiplierText = `時代暴擊 x${option.criticalMultiplier}！`;
      if (window.soundFx) window.soundFx.playCritical();
      this.coinVFX.burst(window.innerWidth / 2, window.innerHeight / 2, 50);
      this.triggerCritBanner();
      this.addFloatingText(this.hero.x, this.hero.y - 50, `💥 暴擊 +${profit} 兩！`, '#ef4444', 24);
    } else {
      if (window.soundFx) window.soundFx.playCoin();
      this.coinVFX.burst(window.innerWidth / 2, window.innerHeight / 2, 25);
      this.addFloatingText(this.hero.x, this.hero.y - 50, `+${profit} 兩`, '#facc15', 20);
    }

    this.state.silver += profit;
    if (option.effects) {
      if (option.effects.reputationDelta) this.state.reputation += option.effects.reputationDelta;
      if (option.effects.knowledgeDelta) this.state.knowledge += option.effects.knowledgeDelta;
      if (option.effects.gainCollectibleId && !this.state.inventoryCollectibles.includes(option.effects.gainCollectibleId)) {
        this.state.inventoryCollectibles.push(option.effects.gainCollectibleId);
      }
    }

    if (option.isHistorical) {
      this.state.historicalDecisionsCount++;
    }

    this.state.choiceHistory.push({
      nodeTitle: node.title,
      optionText: option.text,
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

    document.getElementById('cons-title').innerText = option.isHistorical ? '【順應時代潮流 · 簽署合約】' : '【架空歷史分岔】';
    document.getElementById('cons-title').className = option.isHistorical ? 'text-lg font-bold text-emerald-400' : 'text-lg font-bold text-amber-400';
    document.getElementById('cons-narrative').innerText = option.consequence.narrative;

    const loreBox = document.getElementById('cons-lore');
    if (option.isHistorical) {
      loreBox.innerText = option.consequence.historicalOutcome;
      loreBox.className = 'p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm leading-relaxed';
    } else {
      loreBox.innerText = option.consequence.ifOutcome;
      loreBox.className = 'p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed';
    }

    document.getElementById('cons-profit').innerHTML = `
      <span class="text-slate-300 text-xs">實質入袋收益：</span>
      <span class="text-amber-400 font-extrabold text-xl font-mono">+${profit} 兩</span>
      <span class="text-[10px] px-2 py-0.5 rounded-full ${isCrit ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-slate-300'}">${multiplierText}</span>
    `;

    const nextBtn = document.getElementById('cons-next-btn');
    nextBtn.onclick = () => {
      this.closeModal('consequence-modal');
      if (option.nextNodeId === 'node_settlement') {
        this.renderSettlementReport();
      } else if (this.models.EVENT_NODES[option.nextNodeId]) {
        this.state.currentNodeId = option.nextNodeId;
        this.renderHUD();
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

    const cargoList = [
      { id: 'tea', name: '深坑烏龍茶簍', icon: '🍵', hint: '香氣芬芳 · 時代核心' },
      { id: 'cloth', name: '內地棉麻布疋', icon: '🧵', hint: '商賈日常 · 必備民生' },
      { id: 'sugar', name: '打狗赤砂糖罐', icon: '🍯', hint: '傳統糖郊 · 甜潤可口' },
      { id: 'camphor', name: '三峽腦木碎屑', icon: '🪵', hint: '樟腦提神 · 外銷特產' }
    ];

    const container = document.getElementById('minigame-cargos');
    container.innerHTML = cargoList.map(item => `
      <button id="cargo-${item.id}" onclick="game.clickMinigameCargo('${item.id}')" 
        class="minigame-cargo-card p-4 rounded-2xl bg-slate-800/90 border-2 border-amber-500/50 hover:border-amber-400 flex flex-col items-center justify-center gap-2 group transition-all active:scale-95 shadow-lg relative overflow-hidden">
        <span class="text-4xl group-hover:scale-125 transition-transform">${item.icon}</span>
        <span class="font-serif font-black text-amber-100 text-lg">${item.name}</span>
        <span class="text-sm text-amber-300 font-bold">${item.hint}</span>
      </button>
    `).join('');

    document.getElementById('minigame-progress-text').innerText = `剩餘理貨目標：${this.minigameClicksLeft} 箱`;
  }

  clickMinigameCargo(cargoId) {
    const el = document.getElementById(`cargo-${cargoId}`);
    if (el && el.classList.contains('cargo-stamped')) return;
    if (el) el.classList.add('cargo-stamped');

    if (window.soundFx) window.soundFx.playCoin();
    this.minigameClicksLeft--;
    document.getElementById('minigame-progress-text').innerText = `剩餘理貨目標：${Math.max(0, this.minigameClicksLeft)} 箱`;

    if (this.minigameClicksLeft <= 0) {
      setTimeout(() => {
        this.closeModal('minigame-modal');
        this.rewardClue('clue_dadaocheng_tea');
        this.state.silver += 30; // 工資入袋
        this.renderHUD();
        this.showToast('🎉 理貨完成！獲得 30 兩工資與【大稻埕烏龍茶秘笈】');
        this.addFloatingText(this.hero.x, this.hero.y - 45, '+30 兩打工資！', '#facc15', 22);
      }, 400);
    }
  }

  rewardClue(clueId) {
    const clue = this.models.CLUE_DATABASE[clueId];
    if (!clue) return;

    if (!this.state.unlockedClues.includes(clueId)) {
      this.state.unlockedClues.push(clueId);
      this.state.knowledge += 15;
    }

    if (window.soundFx) window.soundFx.playLevelUp();
    this.coinVFX.burst(window.innerWidth / 2, window.innerHeight / 2, 25);
    this.showClueModal(clue);
    this.renderHUD();
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
    if (window.soundFx) window.soundFx.playLevelUp();
    this.coinVFX.burst(window.innerWidth / 2, window.innerHeight / 2, 60);

    const modal = document.getElementById('settlement-modal');
    if (!modal) return;

    let rank = 'B';
    let title = '北臺灣務實坐賈';
    if (this.state.silver >= 700 && this.state.historicalDecisionsCount >= 2) {
      rank = 'S';
      title = '北臺灣茶業傳奇巨擘';
    } else if (this.state.silver >= 400 || this.state.historicalDecisionsCount >= 1) {
      rank = 'A';
      title = '大稻埕新興茶行領袖';
    }

    document.getElementById('report-rank').innerText = rank;
    document.getElementById('report-title').innerText = title;
    document.getElementById('report-silver').innerText = `${this.state.silver} 兩`;
    document.getElementById('report-reputation').innerText = `${this.state.reputation} 點`;
    document.getElementById('report-knowledge').innerText = `${this.state.knowledge} 點`;
    document.getElementById('report-collectibles').innerText = `${this.state.inventoryCollectibles.length} 件`;

    const summaryText = `在19世紀中後期的開港大潮中，你以見習茶商之姿順應「福爾摩沙烏龍茶」直銷歐美之歷史洪流，累計完成 ${this.state.choiceHistory.length} 次關鍵決策，達成 ${Math.round((this.state.historicalDecisionsCount / Math.max(1, this.state.choiceHistory.length)) * 100)}% 史實關鍵節點吻合率！`;
    document.getElementById('report-summary').innerText = summaryText;

    modal.classList.remove('hidden');
  }

  // ======================== HUD 渲染與介面更新 ========================
  renderHUD() {
    const tier = this.getCurrentTier();
    const currentOutfitObj = this.models.HOME_OUTFITS ? this.models.HOME_OUTFITS.find(o => o.id === this.state.currentOutfit) : null;

    const hudAvatar = document.getElementById('hud-avatar');
    if (hudAvatar) hudAvatar.innerText = currentOutfitObj ? currentOutfitObj.avatar : tier.avatarArt;
    const hudName = document.getElementById('hud-name');
    if (hudName) hudName.innerText = this.state.identityName;
    const hudTier = document.getElementById('hud-tier');
    if (hudTier) hudTier.innerText = currentOutfitObj ? currentOutfitObj.name : tier.name;

    const homeBadge = document.getElementById('hud-home-level-badge');
    if (homeBadge) homeBadge.innerText = `Lv.${this.state.homeLevel || 1}`;

    const hudSilver = document.getElementById('hud-silver');
    if (hudSilver) hudSilver.innerText = `${this.state.silver} 兩`;
    const hudRep = document.getElementById('hud-reputation');
    if (hudRep) hudRep.innerText = this.state.reputation;
    const hudKnow = document.getElementById('hud-knowledge');
    if (hudKnow) hudKnow.innerText = this.state.knowledge;
    const hudRelic = document.getElementById('hud-relic-count');
    if (hudRelic) hudRelic.innerText = `${this.state.inventoryCollectibles.length} 件`;

    const quickClueBadge = document.getElementById('quick-clue-badge');
    if (quickClueBadge) {
      quickClueBadge.innerText = this.state.unlockedClues.length > 0 ? '已掌握' : '點擊解鎖';
      quickClueBadge.className = this.state.unlockedClues.length > 0 ? 'text-xs px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-bold' : 'text-xs px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 font-bold';
    }

    const currentNode = this.models.EVENT_NODES[this.state.currentNodeId];
    if (currentNode) {
      const eraTag = document.getElementById('quest-era-tag');
      if (eraTag) eraTag.innerText = currentNode.era;
      const titleText = document.getElementById('quest-title-text');
      if (titleText) titleText.innerText = currentNode.title;
    }
  }

  updateGameTimer() {
    const el = document.getElementById('game-timer');
    if (!el) return;
    const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    el.innerText = `${mins}:${secs}`;
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

    const cluesDiv = document.getElementById('inv-clues-list');
    if (this.state.unlockedClues.length === 0) {
      cluesDiv.innerHTML = '<p class="text-sm sm:text-base text-slate-400">尚未獲得時代情報，可點擊「碼頭理貨」搜集。</p>';
    } else {
      cluesDiv.innerHTML = this.state.unlockedClues.map(cid => {
        const c = this.models.CLUE_DATABASE[cid];
        return `
          <div class="p-4 rounded-2xl bg-slate-800/90 border border-amber-500/40 flex items-start gap-3.5">
            <span class="text-3xl shrink-0">${c.icon}</span>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-amber-200 text-base sm:text-lg">${c.name} <span class="text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">(${c.rarity})</span></p>
              <p class="text-sm sm:text-base text-slate-200 mt-1 leading-relaxed">${c.gameplayTip}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    const relicsDiv = document.getElementById('inv-relics-list');
    if (this.state.inventoryCollectibles.length === 0) {
      relicsDiv.innerHTML = '<p class="text-sm sm:text-base text-slate-400">尚未收集到歷史奇物文物。</p>';
    } else {
      relicsDiv.innerHTML = this.state.inventoryCollectibles.map(rid => {
        const r = this.models.COLLECTIBLE_DATABASE[rid];
        return `
          <div class="p-4 rounded-2xl bg-slate-800/90 border border-purple-500/40 flex items-start gap-3.5">
            <span class="text-3xl shrink-0">${r.icon}</span>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-purple-200 text-base sm:text-lg">${r.name} <span class="text-xs font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">(${r.rarity})</span></p>
              <p class="text-sm sm:text-base text-emerald-300 font-bold mt-1">✨ ${r.buff}</p>
              <p class="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">${r.lore}</p>
            </div>
          </div>
        `;
      }).join('');
    }

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

  // ======================== 玩家自家宅邸系統 (Player Estate & Wardrobe) ========================
  showHomeModal() {
    if (window.soundFx) window.soundFx.playClick();
    this.renderHomeModal();
    const modal = document.getElementById('home-modal');
    if (modal) modal.classList.remove('hidden');
  }

  switchHomeTab(tabName) {
    if (window.soundFx) window.soundFx.playClick();
    const tabs = ['upgrade', 'wardrobe', 'rent'];
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
    const currentTier = this.models.HOME_TIERS[this.state.homeLevel - 1] || this.models.HOME_TIERS[0];
    const nextTier = this.models.HOME_TIERS[this.state.homeLevel] || null;

    // 頂部與當前房屋
    const badge = document.getElementById('home-modal-badge');
    if (badge) badge.innerText = `Lv.${this.state.homeLevel} ${currentTier.name}`;

    const curIcon = document.getElementById('home-current-icon');
    const icons = ['🛖', '🏡', '🏛️', '🏰'];
    if (curIcon) curIcon.innerText = icons[Math.min(this.state.homeLevel - 1, 3)];

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
            <h4 class="font-serif font-black text-xl text-yellow-300">已起造至大稻埕頂級極致豪邸！</h4>
            <p class="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              您坐擁巴洛克西洋鐘樓豪邸，名震萬國！每週期皆可領取 80 兩巨額洋行分紅！
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

    // 衣裳閣列表渲染
    const outfitsContainer = document.getElementById('home-outfits-list');
    if (outfitsContainer && this.models.HOME_OUTFITS) {
      outfitsContainer.innerHTML = this.models.HOME_OUTFITS.map(outfit => {
        const isUnlocked = this.state.unlockedOutfits.includes(outfit.id) || this.state.homeLevel >= outfit.tierLevelRequired;
        const isEquipped = this.state.currentOutfit === outfit.id;

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
    if (rentDisp) rentDisp.innerText = `${this.state.accumulatedRent || 0} 兩`;
  }

  upgradeHome() {
    const nextTier = this.models.HOME_TIERS[this.state.homeLevel];
    if (!nextTier) return;

    if (this.state.silver < nextTier.cost) {
      const shortage = nextTier.cost - this.state.silver;
      this.showToast(`⚠️ 銀兩不足！尚缺 ${shortage} 兩，快去碼頭打工或洽談洋行商路！`);
      return;
    }

    // 扣除銀兩，提升宅邸等級
    this.state.silver -= nextTier.cost;
    this.state.homeLevel += 1;

    // 自動解鎖對應服裝
    if (nextTier.unlockedOutfitId && !this.state.unlockedOutfits.includes(nextTier.unlockedOutfitId)) {
      this.state.unlockedOutfits.push(nextTier.unlockedOutfitId);
      this.state.currentOutfit = nextTier.unlockedOutfitId; // 自動換上新衣服
    }

    // 慶賀特效與音效
    if (window.soundFx) window.soundFx.playLevelUp();
    this.coinVFX.burst(this.hero.x - this.camera.x, this.hero.y - this.camera.y, 40);

    this.addFloatingText(this.hero.x, this.hero.y - 45, `🏡 宅邸升級為【${nextTier.name}】！`, '#facc15', 20);
    this.showToast(`🎉 恭喜！您在大稻埕起造了【${nextTier.name}】，解鎖新衣裝與商號分紅！`);

    this.renderHUD();
    this.renderHomeModal();
  }

  changeOutfit(outfitId) {
    if (!this.state.unlockedOutfits.includes(outfitId)) {
      const outfit = this.models.HOME_OUTFITS.find(o => o.id === outfitId);
      this.showToast(`⚠️ 此衣裝需擴建宅邸至 Lv.${outfit.tierLevelRequired} 方可解鎖穿戴！`);
      return;
    }

    this.state.currentOutfit = outfitId;
    const outfit = this.models.HOME_OUTFITS.find(o => o.id === outfitId);

    if (window.soundFx) window.soundFx.playClick();
    this.addFloatingText(this.hero.x, this.hero.y - 35, `👘 換穿【${outfit.name}】`, '#38bdf8', 16);
    this.showToast(`👘 已換穿【${outfit.name}】，以嶄新姿態行商大稻埕！`);

    this.renderHUD();
    this.renderHomeModal();
  }

  collectHomeRent() {
    const amount = this.state.accumulatedRent || 0;
    if (amount <= 0) {
      this.showToast('ℹ️ 當前聚寶盆暫無累積店租，稍等片刻鋪面即可產生收益！');
      return;
    }

    this.state.silver += amount;
    this.state.accumulatedRent = 0;

    if (window.soundFx) window.soundFx.playCoin();
    this.coinVFX.burst(this.hero.x - this.camera.x, this.hero.y - this.camera.y, 30);

    this.addFloatingText(this.hero.x, this.hero.y - 40, `+${amount} 兩 (商號店租分紅)`, '#22c55e', 20);
    this.showToast(`💰 成功領取 ${amount} 兩商號鋪面租金分紅！`);

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
}

// 實例化掛載至全域
window.game = new GameController();
window.addEventListener('DOMContentLoaded', () => {
  window.game.init();
});
