from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field, validator
from typing import Dict, Any, Optional, Literal
from ..utils.database import get_db_connection
from ..utils.auth import get_user_id, BaseResponse

router = APIRouter()

# Model definitions for request/response


class VoteCreate(BaseModel):
    voteType: Literal['upvote', 'downvote'] = Field(
        ..., description="Type of vote (upvote or downvote)")


class VoteCounts(BaseModel):
    upvotes: int = Field(..., description="Number of upvotes")
    downvotes: int = Field(..., description="Number of downvotes")
    userVote: Optional[str] = Field(
        None, description="The current user's vote (if authenticated)")


@router.post("/{report_id}", response_model=BaseResponse, summary="Vote on Report")
async def vote_report(report_id: int, data: VoteCreate, user_id: int = Depends(get_user_id)):
    """
    Vote on a report

    Allows a user to upvote or downvote a report.
    If the user has already voted on this report with the same type, the vote will be removed.
    If the user has voted with a different type, their vote will be updated.
    Requires authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if user has already voted
        cursor.execute(
            "SELECT voteType FROM votes WHERE reportID = %s AND userID = %s",
            (report_id, user_id)
        )
        existing_vote = cursor.fetchone()

        if existing_vote:
            # If same vote type, remove the vote (toggle behavior)
            if existing_vote["voteType"] == data.voteType:
                cursor.execute(
                    "DELETE FROM votes WHERE reportID = %s AND userID = %s",
                    (report_id, user_id)
                )
                conn.commit()
                return {"message": f"Vote removed successfully"}
            else:
                # If different vote type, update the vote
                cursor.execute(
                    "UPDATE votes SET voteType = %s WHERE reportID = %s AND userID = %s",
                    (data.voteType, report_id, user_id)
                )
        else:
            # Create new vote
            cursor.execute(
                "INSERT INTO votes (reportID, userID, voteType) VALUES (%s, %s, %s)",
                (report_id, user_id, data.voteType)
            )

        conn.commit()
        return {"message": f"Vote {data.voteType}d successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.get("/{report_id}", response_model=VoteCounts, summary="Get Vote Counts")
async def get_report_votes(report_id: int, user_id: Optional[int] = None):
    """
    Get vote counts for a report

    Returns the number of upvotes and downvotes for a specific report.
    If authenticated, also returns the user's vote.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get upvote count
        cursor.execute(
            "SELECT COUNT(*) as count FROM votes WHERE reportID = %s AND voteType = 'upvote'",
            (report_id,)
        )
        upvotes = cursor.fetchone()['count']

        # Get downvote count
        cursor.execute(
            "SELECT COUNT(*) as count FROM votes WHERE reportID = %s AND voteType = 'downvote'",
            (report_id,)
        )
        downvotes = cursor.fetchone()['count']

        # Get user's vote if user_id is provided
        user_vote = None
        if user_id:
            cursor.execute(
                "SELECT voteType FROM votes WHERE reportID = %s AND userID = %s",
                (report_id, user_id)
            )
            result = cursor.fetchone()
            if result:
                user_vote = result['voteType']

        return {
            "upvotes": upvotes,
            "downvotes": downvotes,
            "userVote": user_vote
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.delete("/{report_id}", response_model=BaseResponse, summary="Remove Vote")
async def remove_vote(report_id: int, user_id: int = Depends(get_user_id)):
    """
    Remove a user's vote from a report

    Removes the current user's vote from a specific report.
    Requires authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM votes WHERE reportID = %s AND userID = %s",
            (report_id, user_id)
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="No vote found")
        conn.commit()
        return {"message": "Vote removed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
