const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  getDeviceInfo: () => ipcRenderer.invoke('get:deviceInfo'),
  sendUniqueDeviceID: (uniqueDeviceID) => ipcRenderer.send('send-unique-device-id', uniqueDeviceID),
})