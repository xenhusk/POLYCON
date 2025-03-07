def calculate_consultation_quality(sentiment_results, transcription_text, duration=None):
    """
    Calculate a quality score for a consultation session based on sentiment analysis.
    
    Parameters:
    - sentiment_results: List of sentiment analysis results from AssemblyAI
    - transcription_text: Full transcription text
    - duration: Duration of the consultation in seconds (optional)
    
    Returns:
    - A score between 0 and 1 representing the quality of the consultation
    - A dict containing detailed metrics
    """
    if not sentiment_results:
        return 0.0, {"error": "No sentiment analysis data available"}
    
    # Calculate sentiment distribution
    sentiment_counts = {"POSITIVE": 0, "NEUTRAL": 0, "NEGATIVE": 0}
    sentiment_confidence_sum = {"POSITIVE": 0, "NEUTRAL": 0, "NEGATIVE": 0}
    
    for result in sentiment_results:
        sentiment = result.get("sentiment")
        confidence = result.get("confidence", 0)
        if sentiment in sentiment_counts:
            sentiment_counts[sentiment] += 1
            sentiment_confidence_sum[sentiment] += confidence
    
    total_sentiments = sum(sentiment_counts.values())
    if total_sentiments == 0:
        return 0.0, {"error": "No valid sentiments found"}
    
    # Calculate positivity ratio (positive / total)
    positivity_ratio = sentiment_counts["POSITIVE"] / total_sentiments
    
    # Calculate negativity ratio (negative / total)
    negativity_ratio = sentiment_counts["NEGATIVE"] / total_sentiments
    
    # Calculate average confidence per sentiment
    avg_confidence = {}
    for sentiment, count in sentiment_counts.items():
        avg_confidence[sentiment] = sentiment_confidence_sum[sentiment] / count if count > 0 else 0
    
    # Calculate consultation length factor (if duration provided)
    duration_factor = 1.0
    if duration:
        # Assuming ideal consultation length is between 10 and 30 minutes
        min_ideal = 10 * 60  # 10 minutes in seconds
        max_ideal = 30 * 60  # 30 minutes in seconds
        
        if duration < min_ideal:
            # Shorter than ideal: scale linearly from 0.5 to 1.0
            duration_factor = 0.5 + (0.5 * duration / min_ideal)
        elif duration > max_ideal:
            # Longer than ideal: scale linearly from 1.0 to 0.8
            excess = duration - max_ideal
            max_excess = 30 * 60  # Allow up to 30 more minutes
            duration_factor = 1.0 - (0.2 * min(excess, max_excess) / max_excess)
    
    # Base score from sentiment distribution
    base_score = (0.7 * positivity_ratio) + (0.3 * (1 - negativity_ratio))
    
    # Confidence adjustment
    confidence_factor = avg_confidence.get("POSITIVE", 0) if "POSITIVE" in avg_confidence else 0.5
    
    # Final score calculation
    quality_score = min(1.0, max(0.0, base_score * confidence_factor * duration_factor))
    
    # Detailed metrics
    metrics = {
        "sentiment_distribution": {s: round(count / total_sentiments * 100, 1) for s, count in sentiment_counts.items()},
        "average_confidence": {s: round(conf, 1) for s, conf in avg_confidence.items()},
        "positivity_ratio": round(positivity_ratio, 2),
        "negativity_ratio": round(negativity_ratio, 2),
        "duration_factor": round(duration_factor, 2) if duration else "N/A",
        "base_score": round(base_score, 2),
        "confidence_factor": round(confidence_factor, 2),
        "final_score": round(quality_score, 2),
    }
    
    return quality_score, metrics