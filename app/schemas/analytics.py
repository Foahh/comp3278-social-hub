from pydantic import BaseModel


class AnalyticsTopPost(BaseModel):
    post_id: int
    username: str
    excerpt: str
    like_count: int


class AnalyticsTopUser(BaseModel):
    username: str
    name: str
    post_count: int
    total_likes: int


class AnalyticsDayCount(BaseModel):
    date: str  # "YYYY-MM-DD"
    count: int


class AnalyticsResponse(BaseModel):
    top_posts: list[AnalyticsTopPost]
    top_users: list[AnalyticsTopUser]
    posts_over_time: list[AnalyticsDayCount]
    likes_over_time: list[AnalyticsDayCount]
