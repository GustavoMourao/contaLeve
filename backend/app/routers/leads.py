import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Lead, Partner, LeadStatus, VoltageLevel
from app.schemas import LeadCreate, LeadResponse, LeadStatusUpdate

router = APIRouter(prefix="/leads", tags=["leads"])
logger = logging.getLogger(__name__)


def _send_lead_email(lead_id: int, partner_name: str, payload: dict) -> None:
    """Send a notification email to the admin when a new lead arrives."""
    if not settings.admin_email or not settings.smtp_user or not settings.smtp_password:
        logger.warning("Email not configured — skipping lead notification (lead #%s)", lead_id)
        return

    sender = settings.smtp_from or settings.smtp_user
    subject = f"[contaLeve] Novo lead #{lead_id} — {payload['name']}"

    voltage_labels = {"low": "Baixa tensão", "medium": "Média tensão", "high": "Alta tensão"}

    html = f"""
<html><body style="font-family:sans-serif;color:#1e293b;max-width:600px;margin:0 auto">
  <div style="background:#16a34a;padding:20px 24px;border-radius:8px 8px 0 0">
    <h1 style="color:#fff;margin:0;font-size:20px">Novo Lead — contaLeve</h1>
    <p style="color:#bbf7d0;margin:4px 0 0">Lead #{lead_id} | Parceiro: {partner_name}</p>
  </div>
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 8px 8px">

    <h2 style="font-size:15px;color:#475569;margin:0 0 16px;text-transform:uppercase;letter-spacing:.05em">Dados do contato</h2>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:6px 0;color:#64748b;width:40%">Nome</td><td style="padding:6px 0;font-weight:600">{payload['name']}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">E-mail</td><td style="padding:6px 0"><a href="mailto:{payload['email']}">{payload['email']}</a></td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Telefone</td><td style="padding:6px 0">{payload.get('phone') or '—'}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Cidade / Estado</td><td style="padding:6px 0">{payload.get('city') or '—'} / {payload.get('state') or '—'}</td></tr>
    </table>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
    <h2 style="font-size:15px;color:#475569;margin:0 0 16px;text-transform:uppercase;letter-spacing:.05em">Dados de consumo</h2>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:6px 0;color:#64748b;width:40%">Distribuidora</td><td style="padding:6px 0">{payload.get('utility') or '—'}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Consumo mensal</td><td style="padding:6px 0">{payload.get('monthly_kwh', 0):,.0f} kWh</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Custo atual</td><td style="padding:6px 0">R$ {payload.get('current_cost', 0):,.2f}/mês</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Tensão</td><td style="padding:6px 0">{voltage_labels.get(payload.get('voltage_level','low'), payload.get('voltage_level',''))}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b">Economia estimada</td><td style="padding:6px 0;color:#16a34a;font-weight:700">R$ {payload.get('estimated_savings', 0):,.2f}/mês</td></tr>
    </table>

    <div style="margin-top:24px;background:#dcfce7;border:1px solid #bbf7d0;border-radius:8px;padding:16px;text-align:center">
      <p style="margin:0;font-size:14px;color:#15803d">
        Parceiro indicado: <strong>{partner_name}</strong>
      </p>
    </div>
  </div>
  <p style="font-size:12px;color:#94a3b8;text-align:center;margin-top:12px">contaLeve — notificação automática</p>
</body></html>
"""

    text = (
        f"Novo lead #{lead_id}\n"
        f"Nome: {payload['name']}\nEmail: {payload['email']}\nTelefone: {payload.get('phone')}\n"
        f"Estado: {payload.get('state')} | Cidade: {payload.get('city')}\n"
        f"Consumo: {payload.get('monthly_kwh')} kWh | Custo: R$ {payload.get('current_cost')}\n"
        f"Economia estimada: R$ {payload.get('estimated_savings')}/mes\n"
        f"Parceiro: {partner_name}\n"
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = settings.admin_email
    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(sender, settings.admin_email, msg.as_string())
        logger.info("Lead notification sent for lead #%s to %s", lead_id, settings.admin_email)
    except Exception as exc:
        logger.error("Failed to send lead email for lead #%s: %s", lead_id, exc)


@router.post("", response_model=LeadResponse, status_code=201)
def create_lead(
    payload: LeadCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """A user requested to be connected with an energy partner."""
    try:
        voltage = VoltageLevel(payload.voltage_level)
    except ValueError:
        voltage = VoltageLevel.low

    partner_name = "—"
    if payload.partner_id:
        partner = db.get(Partner, payload.partner_id)
        if partner:
            partner_name = partner.name

    lead = Lead(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        state=payload.state,
        city=payload.city,
        monthly_kwh=payload.monthly_kwh,
        current_cost=payload.current_cost,
        utility=payload.utility,
        voltage_level=voltage,
        estimated_savings=payload.estimated_savings,
        partner_id=payload.partner_id,
        status=LeadStatus.new,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    # Fire-and-forget email notification
    background_tasks.add_task(
        _send_lead_email,
        lead.id,
        partner_name,
        payload.model_dump(),
    )

    return lead


@router.get("", response_model=list[LeadResponse])
def list_leads(
    status: str | None = None,
    partner_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """List all leads with optional filters."""
    q = db.query(Lead)
    if status:
        try:
            q = q.filter(Lead.status == LeadStatus(status))
        except ValueError:
            pass
    if partner_id:
        q = q.filter(Lead.partner_id == partner_id)
    return q.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()


@router.patch("/{lead_id}/status", response_model=LeadResponse)
def update_lead_status(
    lead_id: int,
    payload: LeadStatusUpdate,
    db: Session = Depends(get_db),
):
    """Update pipeline status of a lead."""
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    try:
        lead.status = LeadStatus(payload.status)
    except ValueError:
        raise HTTPException(status_code=422, detail=f"Invalid status: {payload.status}")
    if payload.notes is not None:
        lead.notes = payload.notes
    db.commit()
    db.refresh(lead)
    return lead
