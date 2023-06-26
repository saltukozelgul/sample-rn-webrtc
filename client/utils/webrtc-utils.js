
import { RTCPeerConnection } from "react-native-webrtc";

export const createPeerConnection = () => {
    let peerConstraints = {
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            }
        ]
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
    const offerDescription = new RTCSessionDescription(offeredDescriptionStr);
    await peerConnection.setRemoteDescription(offerDescription);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return peerConnection.localDescription;
}


