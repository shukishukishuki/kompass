-- README: このSQLは Supabase の SQL Editor で手動実行してください。
-- CLI マイグレーション未連携環境向けに、ビュー作成用SQLを記録しています。

CREATE OR REPLACE VIEW user_action_stats AS
SELECT
  ai_type,
  task_type,
  COUNT(*) AS sample_count,
  ROUND(
    AVG(
      CASE ai_execution_feedback
        WHEN 'good' THEN 3
        WHEN 'meh' THEN 2
        WHEN 'bad' THEN 1
        ELSE NULL
      END
    ),
    2
  ) AS avg_satisfaction
FROM diagnosis_results
WHERE ai_execution_feedback IS NOT NULL
  AND task_type IS NOT NULL
GROUP BY ai_type, task_type;
