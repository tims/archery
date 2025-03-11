
class AARating {
  constructor(A = 0.027, B = 2.37, C = 0.004, E = 3.5, N = 10, D = 50, Face = 1220) {
    this.A = A
    this.B = B // constant determining range of index numbers
    this.C = C // constant determining the excess effect of distance
    this.D = D // distance in meters
    this.E = E // the avg radius of the arrow in mm
    this.Face = Face // the face diameter in mm
    this.N = N // is the number of scoring rings
  }

  withDistance(D) {
    if (D <= 0) {
      throw Exception("distance must be greater than 0")
    }
    this.D = D
    return this;
  }

  withFaceSize(Face) {
    if (Face <= 0) {
      throw Exception("face size in mm must be greater than 0")
    }
    this.Face = Face
    return this;
  }

  withNumScoringRings(N) {
    if (N <= 0) {
      throw Exception("face size in mm must be greater than 0")
    }
    this.N = N
    return this;
  }

  W(I) {
    // W = deviation from center.
    // I = handicap index - this is the rating.
    return this.D * Math.exp(-this.A * I + this.B + this.C * this.D)
  }

  R(i) {
    if (i < 1 || i > this.N) {
      throw Exception("ring out of bounds")
    }
    // the radius of the ring i on the target in mm
    // the 10 ring for a 1220mm face is 61mm
    return (this.Face / this.N) * i / 2
  }

  V(i) {
    // we assume number of rings = number of points
    if (i < 1 || i > this.N) {
      throw Exception("ring out of bounds")
    }
    return this.N - i + 1
  }

  F(i, I) {
    // i = target face ring
    // I = handicap index - this is the rating.
    // face_size = target face size in mm
    if (i == 0) {
      return 1
    }
    if (i < 1 || i > this.N) {
      throw Exception("ring out of bounds")
    }
    var Ri = this.R(i)
    var w = this.W(I)
    return Math.exp(-Math.pow((Ri + this.E) / w, 2) / 2)
  }

  EXPECTED_SCORE(I) {
    let score = 0
    for (var i = 1; i <= this.N; i++) {
      score += (this.F(i - 1, I) - this.F(i, I)) * this.V(i)
    }
    return score
  }
}

function AA_SCORE(distance, face_size, num_arrows, rating) {
  var aaRating = new AARating().withDistance(distance).withFaceSize(face_size)
  return Math.round(aaRating.EXPECTED_SCORE(rating) * num_arrows)
}

function AA_RATING(distance, face_size, num_arrows, score) {
  var aaRating = new AARating().withDistance(distance).withFaceSize(face_size)
  var maxRating = 0
  for (var i = 1; i <= 100; i++) {
    var iScore = Math.round(aaRating.EXPECTED_SCORE(i) * num_arrows)
    if (iScore >= score) {
      return maxRating
    }
    else {
      maxRating = i
    }
  }
  return maxRating
}