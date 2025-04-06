declare module "react-jinke-music-player" {
    export interface AudioInfo {
      name: string
      singer: string
      cover: string
      musicSrc: string
      [key: string]: any
    }
  
    export interface ReactJkMusicPlayerInstance {
      play: () => void
      pause: () => void
      load: () => void
      playByIndex: (index: number) => void
      playNext: () => void
      playPrev: () => void
      togglePlay: () => void
      clear: () => void
      getCurrentPlayIndex: () => number
      addAudio: (audioInfo: AudioInfo) => void
      removeAudio: (index: number) => void
      destroy: () => void
      updatePlayIndex: (index: number) => void
      getAudioLists: () => AudioInfo[]
      updateAudioLists: (audioLists: AudioInfo[]) => void
    }
  
    export interface ReactJkMusicPlayerProps {
      audioLists: AudioInfo[]
      theme?: "dark" | "light"
      mode?: "mini" | "full"
      defaultPosition?: {
        top?: number | string
        right?: number | string
        bottom?: number | string
        left?: number | string
      }
      defaultPlayMode?: "order" | "orderLoop" | "singleLoop" | "shufflePlay"
      autoPlay?: boolean
      showThemeSwitch?: boolean
      showDownload?: boolean
      showReload?: boolean
      showPlayMode?: boolean
      showLyric?: boolean
      showDestroy?: boolean
      toggleMode?: boolean
      responsive?: boolean
      quietUpdate?: boolean
      clearPriorAudioLists?: boolean
      autoPlayInitLoadPlayList?: boolean
      preload?: "auto" | "metadata" | "none"
      glassBg?: boolean
      remove?: boolean
      defaultVolume?: number
      customTheme?: {
        primaryColor?: string
        secondaryColor?: string
      }
      onAudioPlay?: () => void
      onAudioPause?: () => void
      onAudioError?: (errMsg: string, currentPlayId: string) => void
      getAudioInstance?: (instance: ReactJkMusicPlayerInstance) => void
      [key: string]: any
    }
  
    const ReactJkMusicPlayer: React.FC<ReactJkMusicPlayerProps>
  
    export default ReactJkMusicPlayer
  }
  
  