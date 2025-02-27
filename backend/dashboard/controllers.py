from fastapi import APIRouter, HTTPException, Query
from .services import update_user_mood, get_dashboard_data
from .services import get_barchart_data, get_piechart_data, get_donutchart_data
from .schemas import MoodChangeRequest, MoodChangeResponse
from .schemas import DashboardRequest, DashboardResponse
from .schemas import ChartRequest, ChartResponse

router = APIRouter()

@router.put("/api/dashboard/mood/change", response_model=MoodChangeResponse)
async def change_mood(mood_change_request: MoodChangeRequest):
    try:
        mood_data = await update_user_mood(mood_change_request.user_id, mood_change_request.mood)
        return {"status": "success", "data": mood_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/dashboard", response_model=DashboardResponse)
async def get_dashboard(dashboard_request: DashboardRequest):
    try:
        dashboard_data = await get_dashboard_data(dashboard_request.user_id)   
        return {"status": "success", "data": dashboard_data}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    
@router.get("/api/dashboard/barchart", response_model=ChartResponse)
async def get_barchart(barchart_request: ChartRequest):
    try:
        barchart_data = await get_barchart_data(barchart_request.user_id)
        return {"status": "success", "data": barchart_data} 
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/api/dashboard/piechart", response_model=ChartResponse)
async def get_barchart(piechart: ChartRequest):
    try:
        piechart_data = await get_piechart_data(piechart.user_id)
        return {"status": "success", "data": piechart_data} 
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/api/dashboard/donutchart", response_model=ChartResponse)
async def get_donutchart(donutchart: ChartRequest):
    try:
        donutchart_data = await get_donutchart_data(donutchart.user_id)
        return {"status": "success", "data": donutchart_data} 
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))