import {
  FlatList,
  RefreshControl,
  RefreshControlComponent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/feed.styles";
import { useAuth } from "@clerk/clerk-react";
import { STORIES } from "@/constants/mock-data";
import Story from "@/components/Story";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Loader from "@/components/Loader";
import Post from "@/components/Post";
import { useState } from "react";

export default function Index() {
  const { signOut } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  const posts = useQuery(api.posts.getFeedPosts);
  if (posts === undefined) return <Loader />;
  if (posts.length === 0) return <NoPostsFound />;

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      //Tanstack can be used to refetch the data
    }, 2000);
  };
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Spotlight</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* POSTS */}
      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        data={posts}
        renderItem={({ item }) => <Post post={item} />}
        keyExtractor={(item) => item._id.toString()}
        ListHeaderComponent={<StoriesSection />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

const StoriesSection = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={true}
      style={styles.storiesContainer}
    >
      {STORIES.map((story) => (
        <Story key={story.id} story={story} />
      ))}
    </ScrollView>
  );
};

const NoPostsFound = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: COLORS.background,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text style={{ color: COLORS.primary, fontSize: 24 }}>
      No posts found. Please create a post.
    </Text>
  </View>
);
