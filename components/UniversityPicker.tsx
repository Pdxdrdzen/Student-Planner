import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    FlatList, StyleSheet
} from 'react-native';
import { UNIVERSITIES, University } from '../data/universities';

type Props = {
    university: string;
    faculty: string;
    onUniversityChange: (value: string) => void;
    onFacultyChange: (value: string) => void;
};

const UniversityPicker = ({ university, faculty, onUniversityChange, onFacultyChange }: Props) => {
    const [uniQuery, setUniQuery] = useState(university);
    const [facultyQuery, setFacultyQuery] = useState(faculty);
    const [showUniDropdown, setShowUniDropdown] = useState(false);
    const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
    const [selectedUni, setSelectedUni] = useState<University | null>(null);

    //Uni filtering
    const filteredUnis = uniQuery.length >= 2
        ? UNIVERSITIES.filter(u =>
            u.name.toLowerCase().includes(uniQuery.toLowerCase()) ||
            u.city.toLowerCase().includes(uniQuery.toLowerCase())
        )
        : [];

    // Filterings fields of study of a University
    const filteredFaculties = selectedUni && facultyQuery.length >= 1
        ? selectedUni.faculties.filter(f =>
            f.toLowerCase().includes(facultyQuery.toLowerCase())
        )
        : selectedUni?.faculties ?? [];

    const handleSelectUni = (uni: University) => {
        setSelectedUni(uni);
        setUniQuery(uni.name);
        setShowUniDropdown(false);
        onUniversityChange(uni.name);
        // Field of study reset after choosing uni
        setFacultyQuery('');
        onFacultyChange('');
    };

    const handleSelectFaculty = (f: string) => {
        setFacultyQuery(f);
        setShowFacultyDropdown(false);
        onFacultyChange(f);
    };

    return (
        <View>
            {/* Pole uczelni */}
            <Text style={styles.label}>Uczelnia</Text>
            <TextInput
                style={[styles.input, showUniDropdown && styles.inputFocused]}
                placeholder="Zacznij pisać nazwę uczelni..."
                placeholderTextColor="#555"
                value={uniQuery}
                onChangeText={(t) => {
                    setUniQuery(t);
                    setShowUniDropdown(true);
                    if (!t) {
                        setSelectedUni(null);
                        onUniversityChange('');
                        setFacultyQuery('');
                        onFacultyChange('');
                    }
                }}
                onFocus={() => setShowUniDropdown(true)}
                autoCapitalize="none"
            />

            {/* Dropdown uczelni */}
            {showUniDropdown && filteredUnis.length > 0 && (
                <View style={styles.dropdown}>
                    <FlatList
                        data={filteredUnis}
                        keyExtractor={(item) => item.name}
                        keyboardShouldPersistTaps="handled"
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => handleSelectUni(item)}
                            >
                                <Text style={styles.dropdownItemName}>{item.name}</Text>
                                <Text style={styles.dropdownItemCity}>{item.city}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            {/* Pole kierunku — pojawia się dopiero po wyborze uczelni */}
            {selectedUni && (
                <View style={{ marginTop: 16 }}>
                    <Text style={styles.label}>Kierunek</Text>
                    <TextInput
                        style={[styles.input, showFacultyDropdown && styles.inputFocused]}
                        placeholder="Zacznij pisać kierunek..."
                        placeholderTextColor="#555"
                        value={facultyQuery}
                        onChangeText={(t) => {
                            setFacultyQuery(t);
                            setShowFacultyDropdown(true);
                        }}
                        onFocus={() => setShowFacultyDropdown(true)}
                        autoCapitalize="none"
                    />

                    {/* Dropdown kierunków */}
                    {showFacultyDropdown && filteredFaculties.length > 0 && (
                        <View style={styles.dropdown}>
                            <FlatList
                                data={filteredFaculties}
                                keyExtractor={(item) => item}
                                keyboardShouldPersistTaps="handled"
                                scrollEnabled={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => handleSelectFaculty(item)}
                                    >
                                        <Text style={styles.dropdownItemName}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: '#aaa',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    input: {
        backgroundColor: '#161616',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#fff',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    inputFocused: {
        borderColor: '#6C63FF',
        backgroundColor: '#1a1a2e',
    },
    dropdown: {
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        marginTop: 4,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    dropdownItemName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    dropdownItemCity: {
        color: '#666',
        fontSize: 12,
        marginTop: 2,
    },
});

export default UniversityPicker;