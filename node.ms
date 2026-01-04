SELECT jsonb_build_object(
    'comments', (
        SELECT jsonb_build_object(
            'total', COUNT(*),
            'today', COUNT(*) FILTER (
                WHERE created_at >= date_trunc('day', now())
                  AND created_at <  date_trunc('day', now()) + INTERVAL '1 day'
            )
        )
        FROM comments
    ),

    'links', (
        SELECT jsonb_build_object(
            'die', COUNT(*) FILTER (WHERE type = 'die'),
            'undefined', COUNT(*) FILTER (WHERE type = 'undefined'),
            'live', COUNT(*) FILTER (WHERE type IN ('public', 'private'))
        )
        FROM links
        WHERE is_deleted = false
    ),

    'proxy', (
        SELECT jsonb_build_object(
            'active', COUNT(*) FILTER (WHERE status = 'active'),
            'inactive', COUNT(*) FILTER (WHERE status = 'inactive')
        )
        FROM proxy
    ),

    'token', (
        SELECT jsonb_build_object(
            'active', COUNT(*) FILTER (WHERE status = 'active'),
            'limit', COUNT(*) FILTER (WHERE status = 'limit'),
            'die', COUNT(*) FILTER (WHERE status = 'die')
        )
        FROM token
    )
) AS dashboard;