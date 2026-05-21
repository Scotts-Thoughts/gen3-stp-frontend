// Modules to control application life and create native browser window
const { app, shell, BrowserWindow, screen, ipcMain, nativeImage } = require('electron')
const path = require('path')
const fs = require('fs')
const { electronApp, optimizer } = require('@electron-toolkit/utils')

const isDev = !app.isPackaged
const devStateFile = () => path.join(app.getPath('userData'), 'dev-window-state.json')

function loadDevWindowState() {
  try {
    return JSON.parse(fs.readFileSync(devStateFile(), 'utf-8'))
  } catch {
    return null
  }
}

function saveDevWindowState(state) {
  try {
    fs.writeFileSync(devStateFile(), JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save dev window state', e)
  }
}

function boundsOnScreen(bounds) {
  if (!bounds) return false
  return screen.getAllDisplays().some((d) => {
    const b = d.bounds
    return (
      bounds.x < b.x + b.width &&
      bounds.x + bounds.width > b.x &&
      bounds.y < b.y + b.height &&
      bounds.y + bounds.height > b.y
    )
  })
}

function createWindow() {
  const savedState = isDev ? loadDevWindowState() : null
  const useSaved = !!(savedState && boundsOnScreen(savedState.bounds))

  const windowOptions = {
    width: 1920,
    height: 1080,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      sandbox: false,
      contextIsolation: false,
      nodeIntegration: true
    },
  }
  if (useSaved) {
    Object.assign(windowOptions, savedState.bounds)
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow(windowOptions)

  if (useSaved && savedState.isFullScreen) {
    mainWindow.setFullScreen(true)
  }

  // Swap the taskbar/window icon based on the selected game in the renderer.
  const gameIconFile = (game) => {
    switch (game) {
      case 'Emerald':
        return 'icon-emerald.ico'
      case 'FireRed and LeafGreen':
        return 'icon-firered.ico'
      default:
        return 'icon.ico'
    }
  }
  ipcMain.on('set-game-icon', (_event, game) => {
    const img = nativeImage.createFromPath(path.join(__dirname, gameIconFile(game)))
    if (!img.isEmpty()) {
      mainWindow.setIcon(img)
    }
  })

  if (isDev) {
    mainWindow.on('close', () => {
      saveDevWindowState({
        bounds: mainWindow.getNormalBounds(),
        isFullScreen: mainWindow.isFullScreen(),
      })
    })
  }

  if (!useSaved) {
    const contentBounds = mainWindow.getContentBounds()
    const titleBarHeight = 1080 - contentBounds.height
    const borderWidth = (1920 - contentBounds.width) / 2
    if(titleBarHeight > 0 && borderWidth > 0)
    mainWindow.setSize(1920 + borderWidth * 2, 1080 + titleBarHeight)
  }

  mainWindow.on('resize', () => {
    // Get the new size of the window
    const { width } = mainWindow.getContentBounds();
    const { height } = mainWindow.getContentBounds();
    //if odd, add 1 to make it even to prevent invisible 1px taskbar bug in windows 11
    let horizontalZoomFactor = (width+(width%2)) / 1920;
    let verticalZoomFactor = (height+(height%2)) / 1080;
    let zoomFactor = 1;

    //take the smaller factor
    if(horizontalZoomFactor > verticalZoomFactor){
      zoomFactor = verticalZoomFactor;
    }
    else {
      zoomFactor = horizontalZoomFactor;
    }
    if(zoomFactor > 0) {
      mainWindow.webContents.setZoomFactor(zoomFactor);
    }
  })

  mainWindow.on('ready-to-show', () => {
    //zoom the window appropriately before showing
    const { width } = mainWindow.getContentBounds();
    const { height } = mainWindow.getContentBounds();
    
    //if odd, add 1 to make it even to prevent invisible 1px taskbar bug in windows 11
    let horizontalZoomFactor = (width+(width%2)) / 1920;
    let verticalZoomFactor = (height+(height%2)) / 1080;
    let zoomFactor = 1;
    //take the smaller factor
    if(horizontalZoomFactor > verticalZoomFactor){
      zoomFactor = verticalZoomFactor;
    }
    else {
      zoomFactor = horizontalZoomFactor;
    }
    if(zoomFactor > 0) {
      mainWindow.webContents.setZoomFactor(zoomFactor);
    }
    mainWindow.show()
    // mainWindow.webContents.openDevTools()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'app/index.html'))
  
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
