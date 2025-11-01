export function base64ToUint8Array(base64) {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
}

export function createWavFile(bytes, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
    const byteRate = sampleRate * numChannels * bitsPerSample / 8
    const blockAlign = numChannels * bitsPerSample / 8
    const dataSize = bytes.length
    const wavHeader = new Uint8Array(44)
    const view = new DataView(wavHeader.buffer)
    view.setUint32(0, 0x52494646, false) // "RIFF"
    view.setUint32(4, 36 + dataSize, true)
    view.setUint32(8, 0x57415645, false) // "WAVE"
    view.setUint32(12, 0x666d7420, false) // "fmt "
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, byteRate, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitsPerSample, true)
    view.setUint32(36, 0x64617461, false) // "data"
    view.setUint32(40, dataSize, true)
    const wavFile = new Uint8Array(44 + dataSize)
    wavFile.set(wavHeader, 0)
    wavFile.set(bytes, 44)
    return wavFile
}
