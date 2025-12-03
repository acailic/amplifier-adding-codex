from __future__ import annotations

from datetime import UTC
from datetime import datetime
from pathlib import Path

from problempulse.data import DatabaseConfig
from problempulse.data import ProblemRepository
from problempulse.data import ScoreRepository
from problempulse.data import SessionProvider
from problempulse.reporting import ReportGenerator


def _build_repositories(tmp_path: Path) -> tuple[ProblemRepository, ScoreRepository]:
    db_path = tmp_path / "reporting.sqlite"
    config = DatabaseConfig(path=db_path)
    provider = SessionProvider(config)
    return ProblemRepository(provider), ScoreRepository(provider)


def test_report_generator_deduplicates_multiple_scores_for_same_problem(tmp_path: Path) -> None:
    problems, scores = _build_repositories(tmp_path)
    problem = problems.upsert(
        source="reddit",
        source_url="https://reddit.example/post",
        raw_text="Painful workflow",
        extracted_problem="Painful workflow",
        author="UserA",
        created_at=datetime.now(tz=UTC),
        metadata={},
    )
    scores.record(
        problem_id=problem.id,
        urgency=8.0,
        frequency=7.0,
        market_size=6.0,
        monetization=5.0,
        feasibility=4.0,
        final_score=7.5,
    )
    scores.record(
        problem_id=problem.id,
        urgency=7.5,
        frequency=7.0,
        market_size=6.0,
        monetization=5.0,
        feasibility=4.0,
        final_score=7.0,
    )

    generator = ReportGenerator(problems, scores)
    report = generator.generate(hours=24, limit=5)

    assert len(report.items) == 1
    assert report.items[0].problem_id == problem.id
    assert report.items[0].rank == 1


def test_report_generator_deduplicates_same_title_and_author(tmp_path: Path) -> None:
    problems, scores = _build_repositories(tmp_path)
    created = datetime.now(tz=UTC)
    first = problems.upsert(
        source="github",
        source_url="https://github.com/example/issues/1",
        raw_text="Initial body",
        extracted_problem="Deployment is painful",
        author="same-user",
        created_at=created,
        metadata={},
    )
    second = problems.upsert(
        source="github",
        source_url="https://github.com/example/issues/2",
        raw_text="Another body",
        extracted_problem="Deployment is painful",
        author="same-user",
        created_at=created,
        metadata={},
    )
    scores.record(
        problem_id=first.id,
        urgency=9.0,
        frequency=8.0,
        market_size=7.0,
        monetization=6.0,
        feasibility=5.0,
        final_score=8.5,
    )
    scores.record(
        problem_id=second.id,
        urgency=8.5,
        frequency=7.5,
        market_size=7.0,
        monetization=6.0,
        feasibility=5.0,
        final_score=8.0,
    )

    generator = ReportGenerator(problems, scores)
    report = generator.generate(hours=24, limit=5)

    assert len(report.items) == 1
    item = report.items[0]
    assert item.problem_id == first.id
    assert item.title == "Deployment is painful"
    assert item.rank == 1
