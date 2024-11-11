import { StyleSheet, View, TextInput, Pressable, Text } from "react-native"
import { useState } from "react"
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

/**
 * The first screen in the app that
 * users will interact with. This screen
 * allows the user to login with a pre-made
 * account using Firebase Auth.
 * @param {*} props 
 * @returns Login screen (View)
 */
const LoginScreen = (props) => {
    
    const [emailFromUI, setEmailFromUI] = useState("");
    const [passwordFromUI, setPasswordFromUI] = useState("");
    const [loginErrorFromUI, setLoginErrorFromUI] = useState("");

    /**
     * Async function used to login the user
     * and authenticate them. When the email
     * and password specified are correct, the
     * navigation will navigate the user to
     * the next screen which contains the
     * countries list and favorite countries tabs.
     * Implemented using error handling.
     */
    const loginPressed = async () => {
        try {
            await signInWithEmailAndPassword(auth, emailFromUI, passwordFromUI);
            props.navigation.navigate("CountriesTabNavigator");
            reset();
        } catch (err) {
            setLoginErrorFromUI("Error: invalid login! Please try again");
            console.log(err);
        }
    }

    /**
     * Reset the form input fields that the
     * user interacts with by clearing them.
     * (email, password, any error message)
     */
    const reset = () => {
        setEmailFromUI("");
        setPasswordFromUI("");
        setLoginErrorFromUI("");
    }

    /** 
     * The text input has a keyboard type of
     * email address which allows the user
     * to open the keyboard and use the
     * @ symbol, including domain options (.com)
     * The password is hidden as the user is typing
     * with the secureTextEntry property.
    */
    return (
        <View style={styles.container}>
            <View style={styles.loginContainer}>
                <Text style={styles.headerText}>Email</Text>
                <TextInput style={styles.inputField} 
                    placeholder="name@example.com" 
                    keyboardType="email-address" 
                    value={emailFromUI} 
                    onChangeText={setEmailFromUI} />
                <Text style={styles.headerText}>Password</Text>
                <TextInput style={styles.inputField} 
                    placeholder="Enter password" 
                    value={passwordFromUI} 
                    onChangeText={setPasswordFromUI} 
                    secureTextEntry={true} />
                <Text style={styles.errorText}>{loginErrorFromUI}</Text>
                <Pressable style={styles.loginButton} onPress={loginPressed}>
                    <Text style={styles.loginButtonText}>Login</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    loginContainer: {
        margin: "10%",
    },

    headerText: {
        fontSize: 18,
        marginBottom: "3%",
        fontWeight: "bold",
    },

    inputField: {
        borderWidth: 0.5,
        borderRadius: 30,
        padding: "3%",
        marginBottom: "8%",
        borderColor: "gray",
    },

    loginButton: {
        backgroundColor: "#2f7aff",
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 100,
        marginTop: "5%",
        marginLeft: "25%",
        marginRight: "25%",
    },

    loginButtonText: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
    },

    errorText: {
        fontSize: 15,
        color: "red",
        textAlign: "center",
    }
});

export default LoginScreen
