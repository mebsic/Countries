import React from 'react';
import { StyleSheet, View, FlatList, Text, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

/**
 * Once the user is authenticated, they will
 * see a screen with a list of countries,
 * organized by country name and capital.
 * They can click on a country from the list
 * to view its specific details.
 * @param {*} props
 * @returns List of countries (View)
 */
const CountriesListScreen = (props) => {

    const [countriesFromAPI, setCountriesFromAPI] = useState([]);
    const [errorFromAPI, setErrorFromAPI] = useState(false);
    const isFocused = useIsFocused();

    /**
     * Check if the bottom tab is focused,
     * meaning we have entered this current screen.
     * When the component loads, remove any error
     * messages and get all the countries to
     * populate into the list.
     */
    useEffect(() => {
        if (isFocused) {
            setErrorFromAPI(false);
            getAllCountries();
        }
    }, [isFocused]);

    /**
     * Async function used to get the list of
     * countries as a JSON response from the
     * Rest Countries API. The countries data
     * will be set in a useState array.
     * If there is an error fetching, the screen
     * will show an error message to the user.
     * Implemented using error handling.
     */
    const getAllCountries = async () => {
        try {
            const response = await fetch("https://restcountries.com/v3.1/independent?status=true&fields=name,capital,cca2");
            const data = await response.json();
            setCountriesFromAPI(data);
        } catch (err) {
            setErrorFromAPI(true);
            console.log(err);
        }
    }

    /**
     * When the user clicks on an item from
     * the countries list, they will be navigated
     * to the country details screen to view more
     * details. The cca2FromRow is included in order
     * to pass data to the details screen for further
     * usage. For example, the cca2 for Canada is "CA".
     * @param {*} cca2FromRow
     * The unique country code identifier 
     */
    const rowClicked = (cca2FromRow) => {
        props.navigation.navigate("Details", { cca2: cca2FromRow });
    }

    /** 
     * The screen checks if there is an error fetching
     * data from the API or the list is completely empty.
     * Otherwise, the list of countries is displayed
     * in a FlatList, where the country details
     * are surrounded by a Pressable. An arrow (chevron) 
     * icon is used to indicate to the user that
     * they can tap on the item to view more details.
     */
    return (
        <View style={styles.container}>
            {errorFromAPI || countriesFromAPI.length === 0 ? (
                <View style={styles.emptyCountriesContainer}>
                    <Text style={styles.emptyCountriesTitle}>
                        No countries found
                    </Text>
                    <Text style={styles.emptyCountriesDesc}>
                        Please try again later
                    </Text>
                </View>) : (
                <FlatList
                    data={countriesFromAPI}
                    keyExtractor={(item) => {
                        return item.cca2;
                    }}
                    renderItem={({ item }) => {
                        return (
                            <Pressable onPress={() => rowClicked(item.cca2)}>
                                <View style={styles.countryItemContainer}>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.listItemCountryName}>{item.name.common}</Text>
                                        <Text style={styles.listItemCapital}>Capital: {item.capital[0]}</Text>
                                    </View>
                                    <View style={styles.viewCountryDetailsArrow}>
                                        <Ionicons name="chevron-forward-sharp" size={23} color={"#ccc"} />
                                    </View>
                                </View>
                            </Pressable>
                        );
                    }}
                    ItemSeparatorComponent={() => {
                        return <View style={styles.listSeparator} />;
                    }} />)}
        </View>
    );
};

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

    viewCountryDetailsArrow: {
        alignItems: "flex-end",
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

export default CountriesListScreen
