using Godot;
using System;
using System.Diagnostics;
using System.Linq;

public partial class CardTargetSelector : Node2D {
	private int ARC_POINTS = 8;
	public CardUI currentCard;
    public bool targeting = false;

	Events events;
	Area2D area2D;
	Line2D cardArc;

    public override void _Ready() {
        area2D = GetNode<Area2D>("Area2D");
		cardArc = GetNode<Line2D>("CanvasLayer/CardArc");

		events = GetNode<Events>("/root/Events");
		events.CardAimStarted += _OnCardAimStarted;
		events.CardAimEnded += _OnCardAimEnded;
    }

    public override void _Process(double delta) {
        if (!targeting) return;

		area2D.Position = GetLocalMousePosition();
		cardArc.Points = GetPoints();
    }

	public Vector2[] GetPoints() {
		Vector2[] points = new Vector2[ARC_POINTS + 1];
		Vector2 start = currentCard.GlobalPosition;
		start.X += currentCard.Size.X / 2;
		Vector2 target = GetLocalMousePosition();
		Vector2 distance = target - start;

		for (int i = 0; i < ARC_POINTS; i++) {
			double t = i * 1.0 / ARC_POINTS;
			double x = start.X + (i * distance.X / ARC_POINTS);
			double y = start.Y +  EaseOutCubit(t) * distance.Y;
			points[i] = new Vector2((float)x, (float)y);
		}

		points[^1] = target;
		return points;
	}

    private double EaseOutCubit(double t) {
        return 1.0 - Math.Pow(1.0 - t, 3);
    }

	public void _OnCardAimStarted(CardUI _card) {
		Trace.WriteLine("card aim started");

		if (!_card.card.IsSingleTargeted()) return;

		targeting = true;
		area2D.Monitoring = true;
		area2D.Monitorable = true;
		currentCard = _card;
		Trace.WriteLine("Area2D Pos:", area2D.Position.ToString());
	}

	public void _OnCardAimEnded(CardUI _card) {
		Trace.WriteLine("card aim ended");

		targeting = false;
		cardArc.ClearPoints();
		area2D.Position = Vector2.Zero;
		area2D.Monitoring = false;
		area2D.Monitorable = false;
		currentCard = null;
	}

	public void _OnArea2DAreaEntered(Area2D area) {
		if (currentCard is null || !targeting) return;

		if (!currentCard.targets.Contains(area)) {
			currentCard.targets.Add(area);
		}
	}

	public void _OnArea2DAreaExited(Area2D area) {
		if (currentCard is null || !targeting) return;

		currentCard.targets.Remove(area);
	}
}
