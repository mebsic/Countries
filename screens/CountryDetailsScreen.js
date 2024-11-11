import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, Pressable } from "react-native"
import MapView, { Marker } from 'react-native-maps';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from "firebase/firestore";

/**
 * This screen is an extension of the previous
 * screen (Countries List) which provides the
 * user with more details about each country.
 * Users can add a country to their favorites
 * list, persisted to Firebase Firestore.
 * @param {*} props 
 * @returns Country details screen (View)
 */
const CountryDetailsScreen = (props) => {

    const [countryDetailsFromAPI, setCountryDetailsFromAPI] = useState([]);
    const [countryAlreadyAdded, setCountryAlreadyAdded] = useState(false);
    const [errorFromAPI, setErrorFromAPI] = useState(false);
    const cca2FromPreviousScreen = props.route.params.cca2;

    /**
     * When the screen loads, any error messages
     * will be cleared, get the specific country
     * details, and get the country information from
     * Firestore using the cca2 from the previous screen.
     */
    useEffect(() => {
        setErrorFromAPI(false);
        getCountryDetails();
        getCountryFromDB(cca2FromPreviousScreen);
    }, []);

    /**
     * Async function used to fetch country details
     * using the Rest Countries API, passing the cca2
     * code from the previous screen as a URL parameter.
     * The response is a JSON array that is transformed
     * to an object using the countryDetails variable.
     * Implemented using error handling.
     */
    const getCountryDetails = async () => {
        try {
            const response = await fetch(`https://restcountries.com/v3.1/alpha/${cca2FromPreviousScreen}`);
            const data = await response.json();

            /**
             * Some data must be parsed as a number,
             * such as the latitude and longitude for
             * the map view.
             */
            const countryDetails = {
                cca2: cca2FromPreviousScreen,
                name: data[0].name.common,
                capital: data[0].capital[0],
                flagURL: data[0].flags.png,
                latitude: parseFloat(data[0].capitalInfo.latlng[0]),
                longitude: parseFloat(data[0].capitalInfo.latlng[1]),
            }
            setCountryDetailsFromAPI(countryDetails);
        } catch (err) {
            setErrorFromAPI(true);
            console.log(err);
        }
    }

    /**
     * Async function to add a country to the 
     * favorites list. A document reference is used
     * to get the favoriteCountries of the current
     * authenticated user (uid).
     * Implemented using error handling.
     * @param {*} country
     * The country object to save
     */
    const addCountryToFavorites = async (country) => {
        try {
            const docRef = doc(db, "favoriteCountries", auth.currentUser.uid);
            const docSnapshot = await getDoc(docRef);
            let favoriteCountries = [];

            /**
             * If a snapshot exists (meaning we have data),
             * the user already has an existing list of
             * favorite countries added, so get the data.
             */
            if (docSnapshot.exists()) {
                const docData = docSnapshot.data();

                // assign to a local variable (array)
                if (docData.countries) {
                    favoriteCountries = docData.countries;
                }

                /**
                 * Check if the country is already added
                 * using the array and find function. The
                 * criteria to return true is when the country
                 * has been matched by cca2 code.
                 */
                const isCountryAlreadyAdded = favoriteCountries.find(
                    (favCountry) => favCountry.cca2 === country.cca2);

                /**
                 * If the country has not been added before, meaning
                 * it does not exist in Firestore, the data will be copied
                 * into a temporary array and the specific country
                 * object will be pushed, along with setDoc to insert
                 * the new country into the user's favorites list.
                 */
                if (!isCountryAlreadyAdded) {
                    const updatedCountries = Array.from(favoriteCountries);
                    updatedCountries.push(country);
                    await setDoc(docRef, { countries: updatedCountries });

                    // update the star icon to be filled in and confirm with an alert
                    setCountryAlreadyAdded(true);
                    alert(`${country.name} has been added to your favorites!`);
                } else {
                    alert(`${country.name} is already in your favorites list!`);
                }
            } else {
                /**
                 * The snapshot does not exist, meaning the user
                 * has never added any country to their favorites
                 * list before. Therefore, proceed the same way.
                 */
                favoriteCountries.push(country);
                await setDoc(docRef, { countries: favoriteCountries });
                setCountryAlreadyAdded(true);
                alert(`${country.name} has been added to your favorites!`);
            }
        } catch (err) {
            alert(`${country.name} could not be added to your favorites! Please try again`);
            console.log(err);
        }
    }

    /**
     * Async function used to get the status of whether
     * or not a user has the specific country added to
     * their favorites list. Similar to the addCountryToFavorites
     * function, the goal of this function is to update the
     * star by filling it up, which indicates to the
     * user that this country is already favorited.
     * Implemented using error handling.
     * @param {*} cca2
     * unique country identifer from previous screen
     */
    const getCountryFromDB = async (cca2) => {
        try {
            const docRef = doc(db, "favoriteCountries", auth.currentUser.uid);
            const docSnapshot = await getDoc(docRef);

            if (docSnapshot.exists()) {
                let favoriteCountries = [];
                const docData = docSnapshot.data();

                if (docData.countries) {
                    favoriteCountries = docData.countries;
                }
                const isCountryAlreadyAdded = Array.from(favoriteCountries).find(
                    (favCountry) => favCountry.cca2 === cca2);

                if (isCountryAlreadyAdded) {
                    setCountryAlreadyAdded(true);
                }
            }
        } catch (err) {
            alert(`Error getting ${cca2} from the database!`);
            console.log(err);
        }
    }

    /**
     * Similar to the previous screen (Countries List),
     * an error will be displayed if country details
     * could not be fetched from the API. Otherwise,
     * the country details contains the following:
     * - Country Name
     * - Capital
     * - MapView to interact with the country
     * (with a pin/marker on the capital)
     * - Add to Favorites button
     */
    return (
        <View style={styles.container}>
            {errorFromAPI ? (
                <View style={styles.emptyCountriesContainer}>
                    <Text style={styles.emptyCountriesTitle}>Failed to get country details</Text>
                    <Text style={styles.emptyCountriesDesc}>Please try again later</Text>
                </View>
            ) : (
                <View style={styles.countryDetailsContainer}>
                    <View style={styles.topContainer}>
                        <View style={styles.countryInfo}>
                            <Image source={{ uri: countryDetailsFromAPI.flagURL }} style={styles.countryFlag} />
                            <View style={styles.countryDescContainer}>
                                <Text style={styles.countryName}>{countryDetailsFromAPI.name}</Text>
                                <Text style={styles.countryCapital}>Capital: {countryDetailsFromAPI.capital}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.countryMapView}
                            region={{
                                latitude: countryDetailsFromAPI.latitude,
                                longitude: countryDetailsFromAPI.longitude,
                                latitudeDelta: 5,
                                longitudeDelta: 5,
                            }}>
                            <Marker
                                coordinate={{ latitude: countryDetailsFromAPI.latitude, longitude: countryDetailsFromAPI.longitude }}
                                onPress={() => { }} />
                        </MapView>
                        <Pressable
                            style={styles.addToFavoriteCountries}
                            onPress={() => addCountryToFavorites(countryDetailsFromAPI)}>
                            <FontAwesome name={(countryAlreadyAdded) ? "star" : "star-o"} size={23} color="#fff" />
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    countryDetailsContainer: {
        flex: 1,
        marginTop: "5%",
    },

    topContainer: {
        flex: 0.2,
        marginLeft: "5%",
        marginRight: "5%",
    },

    mapContainer: {
        flex: 1.5,
    },

    countryInfo: {
        marginBottom: "5%",
        flexDirection: "row",
        alignItems: "center",
    },

    countryDescContainer: {
        marginLeft: "5%",
    },

    countryName: {
        fontSize: 23,
        marginBottom: "3%",
        fontWeight: "bold",
    },

    countryCapital: {
        fontSize: 17,
        color: "gray",
    },

    countryFlag: {
        width: 100,
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
    },

    countryMapView: {
        flex: 1,
    },

    addToFavoriteCountries: {
        top: "5%",
        right: "5%",
        padding: "3%",
        borderRadius: 100,
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2f7aff",
    },

    emptyCountriesContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    emptyCountriesTitle: {
        fontSize: 20,
        color: "gray",
        fontWeight: "bold",
        marginBottom: "3%",
        textAlign: "center",
    },

    emptyCountriesDesc: {
        fontSize: 16,
        color: "gray",
        paddingLeft: "10%",
        paddingRight: "10%",
        textAlign: "center",
    },
});

export default CountryDetailsScreen
