/** @internal */
BABYLON.GPUParticleSystem.prototype._update = function (emitterWM) {
    if (!this.emitter) {
      return;
    }
    if (!this._recreateUpdateEffect()) {
      return;
    }
    if (this.emitter.position) {
      const emitterMesh = this.emitter;
      emitterWM = emitterMesh.getWorldMatrix();
    } else
    {
      const emitterPosition = this.emitter;
      emitterWM = math_vector/* TmpVectors.Matrix.0 */.jp.Matrix[0];
      math_vector/* Matrix.TranslationToRef */.y3.TranslationToRef(emitterPosition.x, emitterPosition.y, emitterPosition.z, emitterWM);
    }

    //Make DepthWrite false
    const engine = this._engine;
    const depthWriteState = engine.getDepthWrite();
    engine.setDepthWrite(false);

    this._platform.preUpdateParticleBuffer();
    this._updateBuffer.setFloat("currentCount", this._currentActiveCount);
    this._updateBuffer.setFloat("timeDelta", this._timeDelta);
    this._updateBuffer.setFloat("stopFactor", this._stopped ? 0 : 1);
    this._updateBuffer.setInt("randomTextureSize", this._randomTextureSize);
    this._updateBuffer.setFloat2("lifeTime", this.minLifeTime, this.maxLifeTime);
    this._updateBuffer.setFloat2("emitPower", this.minEmitPower, this.maxEmitPower);
    if (!this._colorGradientsTexture) {
      this._updateBuffer.setDirectColor4("color1", this.color1);
      this._updateBuffer.setDirectColor4("color2", this.color2);
    }
    this._updateBuffer.setFloat2("sizeRange", this.minSize, this.maxSize);
    this._updateBuffer.setFloat4("scaleRange", this.minScaleX, this.maxScaleX, this.minScaleY, this.maxScaleY);
    this._updateBuffer.setFloat4("angleRange", this.minAngularSpeed, this.maxAngularSpeed, this.minInitialRotation, this.maxInitialRotation);
    this._updateBuffer.setVector3("gravity", this.gravity);
    if (this._limitVelocityGradientsTexture) {
      this._updateBuffer.setFloat("limitVelocityDamping", this.limitVelocityDamping);
    }
    if (this.particleEmitterType) {
      this.particleEmitterType.applyToShader(this._updateBuffer);
    }
    if (this._isAnimationSheetEnabled) {
      this._updateBuffer.setFloat4("cellInfos", this.startSpriteCellID, this.endSpriteCellID, this.spriteCellChangeSpeed, this.spriteCellLoop ? 1 : 0);
    }
    if (this.noiseTexture) {
      this._updateBuffer.setVector3("noiseStrength", this.noiseStrength);
    }
    if (!this.isLocal) {
      this._updateBuffer.setMatrix("emitterWM", emitterWM);
    }
    this._platform.updateParticleBuffer(this._targetIndex, this._targetBuffer, this._currentActiveCount);
    // Switch VAOs
    this._targetIndex++;
    if (this._targetIndex === 2) {
      this._targetIndex = 0;
    }
    // Switch buffers
    const tmpBuffer = this._sourceBuffer;
    this._sourceBuffer = this._targetBuffer;
    this._targetBuffer = tmpBuffer;

    engine.setDepthWrite(depthWriteState); // UPDATED
  }