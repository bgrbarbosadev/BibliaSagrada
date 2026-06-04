import { useEffect, useRef } from 'react'
import { useReaderStore } from '../store/useReaderStore'
import type { MusicTrackId } from '../store/useReaderStore'

const TRACK_URLS: Record<MusicTrackId, string> = {
  fundo1: '/music/Fundo1.mp3',
  fundo2: '/music/Fundo2.mp3',
  fundo3: '/music/Fundo3.mp3',
  fundo4: '/music/Fundo4.mp3',
}

export default function MusicPlayer() {
  const { musicTrack, musicVolume } = useReaderStore()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const volumeRef = useRef(musicVolume)

  useEffect(() => {
    volumeRef.current = musicVolume
    if (audioRef.current) {
      audioRef.current.volume = musicVolume
    }
  }, [musicVolume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }

    if (!musicTrack) return

    const audio = new Audio(TRACK_URLS[musicTrack])
    audio.loop = true
    audio.volume = volumeRef.current
    // fallback: garante o loop mesmo em MP3s com gap no final
    audio.addEventListener('ended', () => {
      audio.currentTime = 0
      audio.play().catch(() => {})
    })
    audioRef.current = audio
    audio.play().catch(() => {})

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [musicTrack])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  return null
}