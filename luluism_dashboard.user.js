// ==UserScript==
// @name         synergism dashboard
// @namespace    blaze33
// @version      2
// @description  Display relevant stats in a single panel
// @author       blaze33
// @match        https://pseudonian.github.io/SynergismOfficial/
// @grant        GM_addStyle
// ==/UserScript==


(function () {
  'use strict';
  const css = `
  #dashboard {
    text-align: left;
  }
  .db-table {
    display: flex;
    flex-wrap: wrap;
    margin: 0;
    padding: 0.5em;
  }
  .db-table-cell {
    box-sizing: border-box;
    flex-grow: 1;
    width: 50%;
    padding: 0.8em 1.2em;
    overflow: hidden;
    list-style: none;
    border: none;
  }
  .db-stat-line {
    display: flex;
    justify-content: space-between;
  }
  `
  console.log('hello synergism, dashboard installed in the settings tab')
  GM_addStyle(css)

  const settingsTab = document.getElementById('settings')
  const settingsChildNumber = settingsTab.childElementCount - 1

  const tab = document.createElement('div')
  tab.id = 'dashboardSubTab'
  tab.style.display = 'none'
  tab.innerHTML = `
    <div id="dashboard" class="db-table" style="background-color: #111;">
      <div class="db-table-cell" style="width: 35%;">
        <h3 style="color: plum">Overall progress stats</h3>
        <div class="db-stat-line" style="color: orange">Constant: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: yellow">Cube tributes: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: orchid">Tesseract gifts: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: crimson">Hypercube benedictions: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: lightgoldenrodyellow">Platonic Cubes opened: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: #ffac75">C11-14 completions: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: gold">C15 exponent: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: orchid">Blessing levels: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: yellow">Spirit levels: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: plum">Platonic upgrades: <span class="dashboardstat"></span></div>

        <h3 style="color: plum">Current run stats</h3>
        <div class="db-stat-line" style="color: white">Loadout: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: plum">C1-5 completions: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: limegreen">C6-10 completions: <span class="dashboardstat"></span></div>
        <div class="db-stat-line" style="color: cyan">Rune levels: <span class="dashboardstat"></span></div>
        <div class="db-stat-line">Talisman levels: <span class="dashboardstat">
          <span></span> / <span></span> / <span></span> / <span></span> / <span></span> / <span></span> / <span></span>
        </span></div>

        <h3 style="color: plum">Settings</h3>
        <div class="db-stat-line">Autoresearch: <button onclick="toggleAutoResearch()" class="dashboardstat"></button></div>
        <div class="db-stat-line">Autorunes: <button onclick="toggleAutoSacrifice(0)" class="dashboardstat"></button></div>
        <div class="db-stat-line">Autochallenge: <button onclick="toggleAutoChallengeRun()" class="dashboardstat"></button></div>
        <div class="db-stat-line">Ants Autosacrifice: <span class="dashboardstat"> <button onclick="toggleAntAutoSacrifice(0)"></button></span></div>
      </div>
      <div class="db-table-cell">
        <h3 style="color: plum">Time to plat upgrade</h3>
        Platonic upgrade: <input id="db-plat-number" type="number" min="1" max="15" step="1" value="5">
        Number of levels: <input id="db-plat-amount" type="number" min="1" max="100" step="1" value="1">
        <div><pre id="cubeTimes"></pre></div>
      </div>
    </div>`
  settingsTab.appendChild(tab)

  const statValues = {
    0: (el) => el.textContent = format(player.ascendShards),
    1: (el) => el.textContent = document.getElementById("cubeBlessingTotalAmount").textContent,
    2: (el) => el.textContent = document.getElementById("tesseractBlessingTotalAmount").textContent,
    3: (el) => el.textContent = document.getElementById("hypercubeBlessingTotalAmount").textContent,
    4: (el) => el.textContent = document.getElementById("platonicBlessingTotalAmount").textContent,
    5: (el) => el.textContent = player.challengecompletions.slice(11, 15).join(' / '),
    6: (el) => el.textContent = format(player.challenge15Exponent, 0),
    7: (el) => el.textContent = player.runeBlessingLevels.slice(1, 6).map(x => format(x)).join(' / '),
    8: (el) => el.textContent = player.runeSpiritLevels.slice(1, 6).map(x => format(x)).join(' / '),
    9: (el) => el.textContent = player.platonicUpgrades.slice(1, 15).map(x => format(x)).join(' / '),

    10: (el) => el.textContent = player.usedCorruptions.slice(1, 10).join(' / '),
    11: (el) => el.textContent = player.challengecompletions.slice(1, 6).join(' / '),
    12: (el) => el.textContent = player.challengecompletions.slice(6, 11).join(' / '),
    13: (el) => el.textContent = player.runelevels.join(' / '),
    14: (el) => {
      const talismanColors = {
        1: 'white',
        2: 'limegreen',
        3: 'lightblue',
        4: 'plum',
        5: 'orange',
        6: 'crimson'
      }
      Array.from(el.querySelectorAll('span')).forEach((span, i) => {
        span.style.color = talismanColors[player.talismanRarity[i + 1]]
        span.textContent = player.talismanLevels[i + 1]
      })
    },

    15: (el) => {
      const roomba = player.autoResearchToggle
      el.style.color = roomba ? 'green' : 'red'
      el.textContent = roomba ? 'ON' : 'OFF'
    },
    16: (el) => {
      const autorune = player.autoSacrificeToggle
      el.style.color = autorune ? 'green' : 'red'
      el.textContent = autorune ? 'ON' : 'OFF'
    },
    17: (el) => {
      const autoch = player.autoChallengeRunning
      el.style.color = autoch ? 'green' : 'red'
      el.textContent = autoch ? 'ON' : 'OFF'
    },
    18: (el) => {
      const autosac = player.autoAntSacrifice
      const realtime = player.autoAntSacrificeMode === 2
      const seconds = player.autoAntSacTimer
      const text = el.firstChild
      text.data = `(${seconds} ${realtime ? 'real' : 'igt'} seconds) `
      const button = el.lastElementChild
      button.style.color = autosac ? 'green' : 'red'
      button.textContent = autosac ? 'ON' : 'OFF'
    },
  }

  const stats = Array.from(tab.querySelectorAll('.dashboardstat'))
  let dashboardLoopRefFast = 0
  const renderDashboardFast = () => {
    if (currentTab !== 'settings') {
      open = false
      exitDashboard()
      return
    }
    stats.forEach((stat, i) => {
      if (statValues[i]) { statValues[i](stat) }
    })
  }
  const cubeTimes = tab.querySelector('#cubeTimes')
  let dashboardLoopRefSlow = 0
  const renderDashboardSlow = () => {
    const upgrade = Number(document.getElementById('db-plat-number').value)
    const levels = Number(document.getElementById('db-plat-amount').value)
    cubeTimes.textContent = getCubeTimes(upgrade, levels)
  }

  const button = document.createElement('button')
  let activeTab
  button.className = 'chal14'
  button.style = `
    border: 2px solid orange;
    float: right;
    height: 30px;
    width: 150px;
    margin: 9px 0;`
  const openDashboard = () => {
    // compute blessings total amounts
    const n = player.subtabNumber
    currentTab = 'cubes';
    [0, 1, 2, 3].forEach(i => {
      player.subtabNumber = i
      visualUpdateCubes()
    })
    currentTab = 'settings'
    player.subtabNumber = n
    // render and display dashboard
    renderDashboardFast()
    renderDashboardSlow()
    dashboardLoopRefFast = setInterval(renderDashboardFast, 100)
    dashboardLoopRefSlow = setInterval(renderDashboardSlow, 1000)
    activeTab = settingsTab.getElementsByClassName('subtabActive')[0]
    activeTab.style.display = 'none'
    tab.style.display = 'block'
    button.innerText = 'Exit Dashboard'
    button.style.marginLeft = '100%'
    const buttons = settingsTab.getElementsByClassName('subtabSwitcher')[0]
    buttons.style.display = 'none'
  }
  const exitDashboard = () => {
    clearInterval(dashboardLoopRefFast)
    clearInterval(dashboardLoopRefSlow)
    tab.style.display = 'none'
    activeTab.style.display = null
    button.innerText = 'Dashboard'
    button.style.marginLeft = null
    const buttons = settingsTab.getElementsByClassName('subtabSwitcher')[0]
    buttons.style.display = null
  }
  let open = false
  button.onclick = event => {
    if (open) {
      open = false
      exitDashboard()
    } else {
      open = true
      openDashboard()
    }
    return false
  }
  button.innerText = 'Dashboard'
  settingsTab.firstElementChild.insertAdjacentElement('beforebegin', button)

// ==UserScript==
// @name         time to plat upgrade
// @namespace    lulu
// @version      1.3
// @description  Calculates tess, hyper and plat time until next upgrade
// @author       Lulu
// @match        https://pseudonian.github.io/SynergismOfficial/
// @grant        none
// ==/UserScript==

// time to one level of a plat upgrade for Synergism v2.1.1 by lulu
// Usage: paste in the console, call the function getCubeTimes(). defaults to alpha but can be used to find any upgrade and levels by doing getCubeTimes(upgrade,level)

    const SplitTime = (numberOfHours) => {
        var Days=Math.floor(numberOfHours/24);
        var Remainder=numberOfHours % 24;
        var Hours=Math.floor(Remainder);
        var Minutes=Math.floor(60*(Remainder-Hours));
        return({"Days":Days,"Hours":Hours,"Minutes":Minutes})
}

    const getCubeTimes = (i=1, levels=1) => {
        const x=CalcCorruptionStuff();
        const tess=x[5]
        const hyper=x[6]
        const plat=x[7]
        const Upgrades=platUpgradeBaseCosts[i]
        const tessCost=Upgrades.tesseracts*levels
        const hyperCost=Upgrades.hypercubes*levels
        const platCost=Upgrades.platonics*levels
        const time=player.ascensionCounter/3600/24
        const platRate=plat/time
        const hyperRate=hyper/time
        const tessRate=tess/time
        const Day= (player.ascensionCounter)/(3600)
        const platTimeNeeded=(platCost-player.wowPlatonicCubes-plat)/platRate
        const hyperTimeNeeded=(hyperCost-player.wowHypercubes-hyper)/hyperRate
        const tessTimeNeeded=(tessCost-player.wowTesseracts-tess)/tessRate

        var Plats = SplitTime([Math.max(0,((platCost-player.wowPlatonicCubes-x[7])/(x[7]/Day)))]);
        var Hypers = SplitTime([Math.max(0,((hyperCost-player.wowHypercubes-x[6])/(x[6]/Day)))]);
        var Tess = SplitTime([Math.max(0,((tessCost-player.wowTesseracts-x[5])/(x[5]/Day)))]);

        const totalTimeNeeded=Math.max(platTimeNeeded,hyperTimeNeeded,tessTimeNeeded)
        var minutesToAdd= totalTimeNeeded*1440;
        var currentDate = new Date();
        var futureDate = new Date(currentDate.getTime() + minutesToAdd*60000);

if (player.cubeUpgrades[50] < 100000){
      return ("You will need the Power of a Thousand Suns to appreciate the strength of Platonic Upgrades.");
}
if (player.cubeUpgrades[50] = 100000){
    if ((platRate < 1) && ((platCost > player.wowPlatonicCubes) || (tessCost > player.wowTesseracts) || (hyperCost > player.wowHypercubes))){
      return ("Looks like that will take forever!");
    }
    else if ((platCost <= player.wowPlatonicCubes+plat) && (tessCost <= player.wowTesseracts+tess) && (hyperCost <= player.wowHypercubes+hyper)){
    return ("Get it now!")
}
    else{
    return "Time left until next " + [levels] + " level(s) of platonic upgrade " + [i] + " purchase:\n"+
      "Plats: " + Plats.Days + " Days, " + Plats.Hours + " Hours, " + Plats.Minutes + " Minutes \n"+
      "Hypers: " + Hypers.Days + " Days, " + Hypers.Hours + " Hours, " + Hypers.Minutes + " Minutes \n"+
      "Tess: " + Tess.Days + " Days, " + Tess.Hours + " Hours, " + Tess.Minutes + " Minutes \n"+
      "\n"+
       "At your current rate, you are expected to get this at:\n"+
    futureDate + "\n"+
    "\n"+
    "Leftovers after " + [totalTimeNeeded.toPrecision(4)] + " days:\n"+
    "Platonics: " + [(platRate*(totalTimeNeeded-platTimeNeeded)).toPrecision(4)] + " \n"+
    "Hypers: " + [(hyperRate*(totalTimeNeeded-hyperTimeNeeded)).toPrecision(4)] + " \n"+
    "Tesseracts: " + [(tessRate*(totalTimeNeeded-tessTimeNeeded)).toPrecision(4)] ;
        }
    }
}



})();