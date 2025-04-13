from dataclasses import dataclass
from enum import Enum, auto
from datetime import datetime


class VoteType(Enum):
    UPVOTE = auto()
    DOWNVOTE = auto()


@dataclass
class Votes:
    """Class representing a vote."""
    __tablename__ = "votes"
    vote_id: int
    report_id: int
    user_id: int
    vote_type: VoteType
    voted_at: datetime
