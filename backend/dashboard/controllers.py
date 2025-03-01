from fastapi import APIRouter, HTTPException, Query
from .services import update_user_mood, get_dashboard_data
from .services import get_barchart_data, get_piechart_data, get_donutchart_data
from .services import delete_task, complete_task, detail_task, edit_task, upcoming_task
from .schemas import MoodChangeRequest, MoodChangeResponse
from .schemas import DashboardRequest, DashboardResponse
from .schemas import ChartRequest, ChartResponse
from .schemas import DelComTaskRequest, DelComTaskResponse
from .schemas import EditTaskRequest, EditTaskResponse
from .schemas import UpcomingTaskResponse

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

### Chart 
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

### Upcoming Task   
@router.delete("/api/dashboard/upcoming/delete", response_model=DelComTaskResponse)
async def delete_task_endpoint(delete_task_request: DelComTaskRequest):
    try:
        await delete_task(delete_task_request.user_id, delete_task_request.task_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/api/dashboard/upcoming/complete", response_model=DelComTaskResponse)
async def complete_task_endpoint(delete_task_request: DelComTaskRequest):
    try:
        await complete_task(delete_task_request.user_id, delete_task_request.task_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/dashboard/upcoming/detail", response_model=DashboardResponse)
async def detail_task_endpoint(delete_task_request: DelComTaskRequest):
    try:
        detail_data = await detail_task(delete_task_request.user_id, delete_task_request.task_id)
        return {"status": "success", "data": detail_data} 
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/api/dashboard/upcoming/update", response_model=EditTaskResponse)
async def edit_task_endpoint(edit_task_request: EditTaskRequest):
    try:
        edited_task = await edit_task(edit_task_request)
        return {"status": "success", "data": edited_task}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/api/dashboard/upcoming/overall", response_model=UpcomingTaskResponse)
async def get_upcoming_task(upcoming_request: DashboardRequest):
    try:
        overall_task = await upcoming_task(upcoming_request.user_id)
        return {"status": "success", "data": overall_task}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))