
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
    await peerConnection.setRemoteDescription(offeredDescriptionStr);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return peerConnection.localDescription;
}



