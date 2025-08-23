import { Asset } from 'expo-asset';

const vowelAudioModules = [
    require('../../assets/sounds/hiragana/a.mp3'),
    require('../../assets/sounds/hiragana/i.mp3'),
    require('../../assets/sounds/hiragana/u.mp3'),
    require('../../assets/sounds/hiragana/e.mp3'),
    require('../../assets/sounds/hiragana/o.mp3'),
];

let cachePromise: Promise<Asset[]>  | null = null;


export function preloadVowelAudio() {
    //evita recarga
    if(!cachePromise) {
        cachePromise = Promise.all(
            vowelAudioModules.map( m => Asset.fromModule(m).downloadAsync())
        );
    }
    return cachePromise;
}