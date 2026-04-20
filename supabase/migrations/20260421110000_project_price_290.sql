-- Тариф Project: 490 ₽ → 290 ₽
update public.plans
set price_cents = 29000,
    updated_at = now()
where slug = 'project';
