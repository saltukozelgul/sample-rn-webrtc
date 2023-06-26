import React from "react";
import { SafeAreaView, StyleSheet, View, Button } from "react-native";
import Snackbar from "react-native-snackbar";
import { RTCView, mediaDevices, MediaStream } from "react-native-webrtc";


const App = () => {
  const [isLocalStreamStarted, setIsLocalStreamStarted] = React.useState<boolean>(false);
  const [localStream, setLocalStream] = React.useState<MediaStream>();


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
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
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
        <Button title="Start Stream" onPress={startLocalStream} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Stop Stream" onPress={stopLocalStream} />
      </View>
    </SafeAreaView>
  );


};

export default App;
