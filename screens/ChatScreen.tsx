import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import AnimatedBackground from '../components/AnimatedBackground';

type ChatMessage = {
    id: string;
    author: string;
    text: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
    { id: '1', author: 'Klaudia', text: 'Wyrobimy się ze sprintem?' },
    { id: '2', author: 'Przemek', text: 'Ja ogarnę ekran logowania.' },
    { id: '3', author: 'Ania', text: 'Mogę jutro dokończyć widok wydarzeń.' },
];

export default function ChatScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
    const [chatInput, setChatInput] = useState('');
    const listRef = useRef<FlatList>(null);

    const handleSendMessage = () => {
        const trimmed = chatInput.trim();
        if (!trimmed) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            author: 'Ty',
            text: trimmed,
        };

        setMessages((prev) => [...prev, newMessage]);
        setChatInput('');

        setTimeout(() => {
            listRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
            <SafeAreaView style={styles.container}>
                <AnimatedBackground />

                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
                >
                    <View style={styles.headerBlock}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>✦ Czat grupy</Text>
                        </View>

                        <Text style={styles.title}>Rozmowa zespołu</Text>
                        <Text style={styles.subtitle}>
                            Ustalajcie zadania, terminy i postępy w jednym miejscu.
                        </Text>
                    </View>

                    <FlatList
                        ref={listRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.messagesList}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={() =>
                            listRef.current?.scrollToEnd({ animated: true })
                        }
                        renderItem={({ item }) => {
                            const isMine = item.author === 'Ty';

                            return (
                                <View
                                    style={[
                                        styles.messageRow,
                                        isMine && styles.messageRowMine,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.messageBubble,
                                            isMine && styles.messageBubbleMine,
                                        ]}
                                    >
                                        {!isMine && (
                                            <Text style={styles.messageAuthor}>{item.author}</Text>
                                        )}
                                        <Text
                                            style={[
                                                styles.messageText,
                                                isMine && styles.messageTextMine,
                                            ]}
                                        >
                                            {item.text}
                                        </Text>
                                    </View>
                                </View>
                            );
                        }}
                    />

                    <View style={styles.inputBar}>
                        <TextInput
                            value={chatInput}
                            onChangeText={setChatInput}
                            placeholder="Napisz wiadomość..."
                            placeholderTextColor="#666"
                            style={styles.input}
                        />
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleSendMessage}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.sendButtonText}>Wyślij</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
    },
    headerBlock: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: '#6C63FF1A',
        borderRadius: 99,
        borderWidth: 1,
        borderColor: '#6C63FF44',
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginBottom: 12,
    },
    badgeText: {
        color: '#9D97FF',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.4,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    subtitle: {
        color: '#666',
        fontSize: 14,
        lineHeight: 20,
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        gap: 10,
    },
    messageRow: {
        alignItems: 'flex-start',
    },
    messageRowMine: {
        alignItems: 'flex-end',
    },
    messageBubble: {
        maxWidth: '82%',
        backgroundColor: '#161616',
        borderWidth: 1,
        borderColor: '#242424',
        borderRadius: 18,
        paddingHorizontal: 13,
        paddingVertical: 10,
    },
    messageBubbleMine: {
        backgroundColor: '#6C63FF22',
        borderColor: '#6C63FF55',
    },
    messageAuthor: {
        color: '#BFB8FF',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
    },
    messageText: {
        color: '#E8E8E8',
        fontSize: 14,
        lineHeight: 20,
    },
    messageTextMine: {
        color: '#fff',
    },
    inputBar: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#222',
        backgroundColor: '#101010',
    },
    input: {
        flex: 1,
        backgroundColor: '#161616',
        borderWidth: 1,
        borderColor: '#242424',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: '#fff',
        fontSize: 14,
    },
    sendButton: {
        backgroundColor: '#6C63FF',
        borderRadius: 14,
        paddingHorizontal: 16,
        justifyContent: 'center',
        shadowColor: '#6C63FF',
        shadowOpacity: 0.28,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 13,
    },
});