from typing import Any, Dict, Optional, List

class UserService:
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        raise NotImplementedError

    def create_user(self, user_data: Dict[str, Any]) -> str:
        raise NotImplementedError

    def update_user(self, user_id: str, user_data: Dict[str, Any]) -> bool:
        raise NotImplementedError

    def delete_user(self, user_id: str) -> bool:
        raise NotImplementedError

    # Progress logs
    def add_workout_log(self, user_id: str, log_data: Dict[str, Any]) -> str:
        raise NotImplementedError

    def get_workout_logs(self, user_id: str) -> List[Dict[str, Any]]:
        raise NotImplementedError

    def add_recipe_history(self, user_id: str, recipe_data: Dict[str, Any]) -> str:
        raise NotImplementedError

    def get_recipe_history(self, user_id: str) -> List[Dict[str, Any]]:
        raise NotImplementedError

    def add_weight_log(self, user_id: str, log_data: Dict[str, Any]) -> str:
        raise NotImplementedError

    def get_weight_logs(self, user_id: str) -> List[Dict[str, Any]]:
        raise NotImplementedError

    # Followers/Following
    def add_follower(self, user_id: str, follower_id: str) -> bool:
        raise NotImplementedError

    def get_followers(self, user_id: str) -> List[Dict[str, Any]]:
        raise NotImplementedError

    def add_following(self, user_id: str, following_id: str) -> bool:
        raise NotImplementedError

    def get_following(self, user_id: str) -> List[Dict[str, Any]]:
        raise NotImplementedError
