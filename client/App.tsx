import React, { useRef, useState } from "react";
import { SafeAreaView, StyleSheet, View, Button, Text, TextInput, NativeModules } from "react-native";
import Snackbar from "react-native-snackbar";
import { RTCView, mediaDevices, MediaStream } from "react-native-webrtc";
import { createPeerConnection, createOffer, createAnswer } from "./utils/webrtc-utils";
import SocketIOClient from "socket.io-client";

const App = () => {
  const [callerId] = useState(
    Math.floor(100000 + Math.random() * 900000).toString(),
  );
  const otherUserId = useRef(null);

  const [isLocalStreamStarted, setIsLocalStreamStarted] = useState<boolean>(false);
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();

  const socket = SocketIOClient("http://192.168.1.107:3500", {
    transports: ["websocket"],
    query: {
      callerId,
    },
  });

  let peerConnection = createPeerConnection();
  let dataChannel = peerConnection.createDataChannel("dataChannel");

  const createOfferFunction = async () => {
    const offer = await createOffer(peerConnection);

    console.log("Offer", offer);

    // Send offer to remote peer
    // socket.emit("offer", offer);
  };

  const createAnswerFunction = async (offer: any) => {
    const answer = await createAnswer(peerConnection, offer);

    console.log("Answer", answer);

    // Send answer to remote peer
    // socket.emit("answer", answer);
  };

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
      peerConnection?.addTrack(track, stream);
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
      flex: 8,
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
      width: "60%",
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
      <View style={styles.buttonContainer}>
        <TextInput style={styles.textInput} placeholder="Enter other user id" onChangeText={(text) => console.log(text)} />
        {
          isLocalStreamStarted ? (
            <Button title="Stop Call" onPress={stopLocalStream} />
          ) : (
            <Button title="Call Now" onPress={startLocalStream} />
          )
        }
      </View>
    </SafeAreaView>
  );


};

export default App;
