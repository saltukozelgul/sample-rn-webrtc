import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, View, Button, Text, TextInput, NativeModules } from "react-native";
import Snackbar from "react-native-snackbar";
import { RTCView, mediaDevices, MediaStream, RTCIceCandidate, RTCSessionDescription, RTCPeerConnection } from "react-native-webrtc";
import { createPeerConnection, createOffer, createAnswer } from "./utils/webrtc-utils";
import SocketIOClient from "socket.io-client";

const App = () => {

  const [callerId] = useState(
    Math.floor(100000 + Math.random() * 900000).toString(),
  );
  const otherUserId = useRef<String>();

  const [isLocalStreamStarted, setIsLocalStreamStarted] = useState<boolean>(false);

  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();

  const socket = SocketIOClient("http://192.168.1.107:3500", {
    transports: ["websocket"],
    query: {
      callerId,
    },
  });

  const peerConnection = useRef(
    new RTCPeerConnection({
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
    }),
  );

  let remoteRTCMessage = useRef<any>(null);

  const createOfferFunction = async () => {
    // start local stream
    await startLocalStream();
    const offer = await createOffer(peerConnection);
    var data = {
      "calleeId": otherUserId.current,
      "rtcMessage": offer,
    };
    // Send offer to remote peer
    socket.emit("call", data);
  };

  useEffect(() => {
    socket.on("newCall", async (data) => {
      const offer = data.rtcMessage;
      var answerSDP = await createAnswer(peerConnection, offer);
      var sentData = {
        "callerId": data.callerId,
        "answer": answerSDP,
      };
      // Send answer to remote peer
      socket.emit("answerCall", sentData);
    })

    socket.on("callAnswered", async (data) => {
      const answer = data.rtcMessage;
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
    })

    socket.on('ICEcandidate', data => {
      let message = data.rtcMessage;

      if (peerConnection) {
        peerConnection.current.addIceCandidate(
          new RTCIceCandidate({
            candidate: message.candidate,
            sdpMid: message.id,
            sdpMLineIndex: message.label,
          }),
        )
          .then(data => {
            console.log('SUCCESS');
          })
          .catch(err => {
            console.log('Error', err);
          });
      }
    });

    return () => {
      socket.off("newCall");
      socket.off("callAnswered");
      socket.off("ICEcandidate");
    };

  }, []);

  const startLocalStream = async () => {
    if (isLocalStreamStarted) {
      // Notify user that stream is already started
      Snackbar.show({
        text: "Stream is already started",
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    // Add tracks to peer connection
    stream.getTracks().forEach((track) => {
      peerConnection?.current.addTrack(track, stream);
    });
    setLocalStream(stream);
    setIsLocalStreamStarted(true);
  };

  const stopLocalStream = () => {
    if (!isLocalStreamStarted) {
      // Notify user that stream is already stopped
      Snackbar.show({
        text: "Stream is already stopped",
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    localStream?.getTracks().forEach((track) => {
      track.stop();
    });
    setLocalStream(undefined);
    setIsLocalStreamStarted(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    videoContainer: {
      flex: 4,
      justifyContent: "center",
      alignItems: "center",
    },
    video: {
      width: "100%",
      height: "100%",
    },
    buttonContainer: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    button: {
      marginHorizontal: 10,
    },
    textContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    textInput: {
      borderWidth: 1,
      borderColor: "black",
      width: "50%",
      padding: 10,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={{ fontSize: 20 }}>Caller ID: {callerId}</Text>
      </View>
      <View style={styles.videoContainer}>
        {
          localStream && (
            <RTCView
              streamURL={localStream!.toURL()}
              style={styles.video}
            />
          )
        }
      </View>
      <View style={styles.videoContainer}>
        {
          remoteStream && (
            <RTCView
              streamURL={remoteStream!.toURL()}
              style={styles.video}
            />
          )
        }
      </View>
      <View style={styles.buttonContainer}>
        <TextInput style={styles.textInput} placeholder="Enter other user id" onChangeText={(text) => otherUserId.current = text} />
        {
          isLocalStreamStarted ? (
            <Button title="Stop Call" onPress={stopLocalStream} />
          ) : (
            <Button title="Call Now" onPress={createOfferFunction} />
          )
        }
        <Button title="Start" onPress={startLocalStream} />
      </View>
    </SafeAreaView>
  );


};

export default App;
