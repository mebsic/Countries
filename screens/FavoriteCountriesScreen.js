import { StyleSheet, View, FlatList, Text, Pressable } from "react-native"
import { useState, useEffect } from "react"
import { useIsFocused } from '@react-navigation/native';
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { FontAwesome } from "@expo/vector-icons";

/**
 * The last screen in the app. This screen contains
 * a list of favorite countries the user has added
 * which is retrieved from Firebase Firestore. The
 * user can also delete a specific country.
 * @returns List of favorite countries (View)
 */
const FavoriteCountriesScreen = () => {

    const [countriesFromDB, setCountriesFromDB] = useState([]);
    const [emptyFavoritesFromDB, setEmptyFavoritesFromDB] = useState(true);
    const isFocused = useIsFocused();

    /**
     * Similar to the Countries List screen,
     * when the component loads, it means we
     * are focused on the current tab. Therefore, 
     * get the countries from the database in 
     * order to display them to the user.
     */
    useEffect(() => {
        if (isFocused) {
            getCountriesFromDB();
        }
    }, [isFocused]);

    /**
     * Async function used to retrieve the list of
     * favorite countries from Firestore for the
     * currently authenticated user (uid). This
     * function checks if there is data and the
     * array which stores country objects is not
     * empty, it will remove the "empty countries"
     * message and populate a list of items in 
     * a countriesFromDB useState variable.
     * Implemented using error handling.
     */
    const getCountriesFromDB = async () => {
        try {
            const countriesRef = doc(db, "favoriteCountries", auth.currentUser.uid);
            const countriesSnapshot = await getDoc(countriesRef);

            if (countriesSnapshot.exists()) {
                const countriesData = countriesSnapshot.data();
                if (countriesData.countries && countriesData.countries.length > 0) {
                    setEmptyFavoritesFromDB(false);
                    setCountriesFromDB(countriesData.countries);
                }
            }
        } catch (err) {
            alert("Failed to get countries from the database! Please try again");
            console.log(err);
        }
    }

    /**
     * Async function used to filter through the
     * current list of favorite countries and
     * update the array by removing it.
     * An alert confirmation is displayed
     * to the user when a country was
     * successfully deleted.
     * Implemented using error handling.
     * @param {*} country 
     * The country object to delete
     */
    const deleteCountryFromFavorites = async (country) => {
        try {
            /** 
             * Return the updated list of favorite countries
             * from the array when it meets the condition 
             * specified in a callback function. (cca2 code
             * is not equal to the country, meaning delete it).
             */
            const updatedFavoriteCountries = countriesFromDB.filter((i) => i.cca2 !== country.cca2);

            /**
             * If the size of the array is not empty,
             * then update the document for the currently
             * authenticated user with the new list after
             * it has been filtered.
             */
            if (updatedFavoriteCountries.length > 0) {
                const countriesRef = doc(db, "favoriteCountries", auth.currentUser.uid);
                await updateDoc(countriesRef, { countries: updatedFavoriteCountries });

                // refresh the screen by getting the countries again
                setCountriesFromDB(updatedFavoriteCountries);
                getCountriesFromDB();
            } else {
                /**
                 * The list has no more items, meaning it
                 * is empty, so delete the entire document
                 * for the current user altogether, as it
                 * is no longer required. The screen also updates
                 * to show that the user has no favorite countries.
                 */
                await deleteDoc(doc(db, "favoriteCountries", auth.currentUser.uid));
                setEmptyFavoritesFromDB(true);
            }

            alert(`${country.name} was deleted from your favorites!`);
        } catch (err) {
            alert(`${country.name} could not be deleted! Please try again`);
            console.log(err);
        }
    }

    /**
     * Display a list of countries in a FlatList, similar
     * in layout to the Countries List screen. The user can
     * delete a country by clicking the trash icon
     * on the right side of each item in the list.
     */
    return (
        <View style={styles.container}>
            {emptyFavoritesFromDB ? (
                <View style={styles.emptyFavoritesContainer}>
                    <Text style={styles.emptyFavoritesTitle}>
                        Your favorite countries is empty
                    </Text>
                    <Text style={styles.emptyFavoritesDesc}>
                        To save a country, tap the star
                    </Text>
                </View>) : (
                <FlatList
                    data={countriesFromDB}
                    keyExtractor={(item) => {
                        return item.cca2;
                    }}
                    renderItem={({ item }) => {
                        return (
                            <View style={styles.countryItemContainer}>
                                <View style={styles.textContainer}>
                                    <Text style={styles.listItemCountryName}>{item.name}</Text>
                                    <Text style={styles.listItemCapital}>Capital: {item.capital}</Text>
                                </View>
                                <Pressable
                                    style={styles.deleteFromFavorites}
                                    onPress={() => deleteCountryFromFavorites(item)}>
                                    <FontAwesome name="trash" size={18} color="white" />
                                </Pressable>
                            </View>
                        );
                    }}
                    ItemSeparatorComponent={() => {
                        return <View style={styles.listSeparator} />;
                    }} />)}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    countryItemContainer: {
        padding: "6%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    textContainer: {
        flex: 1,
    },

    listItemCountryName: {
        fontSize: 18,
        marginBottom: "5%",
    },

    listItemCapital: {
        fontSize: 15,
        color: "gray",
    },

    listSeparator: {
        borderWidth: 0.5,
        marginLeft: "5%",
        marginRight: "5%",
        borderColor: "#ccc",
    },

    deleteFromFavorites: {
        borderRadius: 50,
        width: 36,
        height: 36,
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
    },

    listSeparator: {
        borderWidth: 0.5,
        marginLeft: "5%",
        marginRight: "5%",
        borderColor: "#ccc",
    },

    emptyFavoritesContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    emptyFavoritesTitle: {
        fontSize: 20,
        color: "gray",
        fontWeight: "bold",
        marginBottom: "3%",
        textAlign: "center",
    },

    emptyFavoritesDesc: {
        fontSize: 16,
        color: "gray",
        paddingLeft: "10%",
        paddingRight: "10%",
        textAlign: "center",
    },
});

export default FavoriteCountriesScreen
