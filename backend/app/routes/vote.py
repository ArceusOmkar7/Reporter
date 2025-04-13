from fastapi import APIRouter, HTTPException, Depends, Path
from pydantic import BaseModel, Field, validator
from typing import Dict, Any, Optional, Literal
from ..utils.database import get_db_connection
from ..utils.auth import get_token_user, BaseResponse

router = APIRouter()

# Model definitions for request/response


class VoteCreate(BaseModel):
    voteType: str = Field(..., description="Vote type: 'upvote' or 'downvote'")

    @validator('voteType')
    def validate_vote_type(cls, v):
        if v.lower() not in ['upvote', 'downvote']:
            raise ValueError("Vote type must be 'upvote' or 'downvote'")
        return v.lower()


class VoteCounts(BaseModel):
    upvotes: int = Field(..., description="Number of upvotes")
    downvotes: int = Field(..., description="Number of downvotes")


@router.post("/{report_id}", response_model=BaseResponse, summary="Vote on Report")
async def vote_report(report_id: int, data: VoteCreate, current_user: int = Depends(get_token_user)):
    """
    Vote on a report

    Allows a user to upvote or downvote a report.
    If the user has already voted on this report, the previous vote will be updated.
    Requires authentication.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if user has already voted
        cursor.execute(
            "SELECT * FROM votes WHERE reportID = %s AND userID = %s",
            (report_id, current_user)
        )
        existing_vote = cursor.fetchone()

        if existing_vote:
            # Update existing vote
            cursor.execute(
                "UPDATE votes SET voteType = %s WHERE reportID = %s AND userID = %s",
                (data.voteType, report_id, current_user)
            )
        else:
            # Create new vote
            cursor.execute(
                "INSERT INTO votes (reportID, userID, voteType) VALUES (%s, %s, %s)",
                (report_id, current_user, data.voteType)
            )

        conn.commit()
        return {"message": f"Vote {data.voteType}d successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.get("/{report_id}", response_model=VoteCounts, summary="Get Vote Counts")
async def get_report_votes(report_id: int):
    """
    Get vote counts for a report

    Returns the number of upvotes and downvotes for a specific report.
    This endpoint does not require authentication.
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

        return {
            "upvotes": upvotes,
            "downvotes": downvotes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.delete("/{report_id}", response_model=BaseResponse, summary="Remove Vote")
async def remove_vote(report_id: int, current_user: int = Depends(get_token_user)):
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
            (report_id, current_user)
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
