
import { RTCPeerConnection } from "react-native-webrtc";

export const createPeerConnection = () => {
    let peerConstraints = {
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302',
            },
            {
                urls: 'stun:stun1.l.google.com:19302',
            },
            {
                urls: 'stun:stun2.l.google.com:19302',
            },
        ],
    };
    return new RTCPeerConnection(peerConstraints);
}

export const createOffer = async (peerConnection) => {
    let sessionConstraints = {
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true,
            VoiceActivityDetection: true
        }
    };
    let offer = await peerConnection.createOffer(sessionConstraints);
    console.log("Offer created", offer);
    await peerConnection.setLocalDescription(offer);
    return peerConnection.localDescription;
}

export const createAnswer = async (peerConnection, offeredDescriptionStr) => {
    const sessionConstraints = {
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true,
            VoiceActivityDetection: true
        }
    };
    await peerConnection.current.setRemoteDescription(offeredDescriptionStr);
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    return peerConnection.current.localDescription;
}



