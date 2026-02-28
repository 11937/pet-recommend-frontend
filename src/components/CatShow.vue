
                            <!-- 卡片详情弹窗 -->
                            <div class="detail-info">
                              <div class="info-item">
                                <span class="label">适配户型：</span>
                                <span class="value">{{ getHousingText(currentCat.suitableHousing) }}</span>
                              </div>
                              <div class="info-item">
                                <span class="label">每日护理时长：</span>
                                <span class="value">{{ currentCat.requiredCareHours || 0 }} 小时</span>
                              </div>
                              <div class="info-item">
                                <span class="label">适配饲养经验：</span>
                                <span class="value">{{ getExperienceText(currentCat.suitableExperience) }}</span>
                              </div>
                              <div class="info-item">
                                <span class="label">饲养预算：</span>
                                <span class="value">{{ getBudgetText(currentCat.budgetLevel) }}</span>
                              </div>
                              <div class="info-item">
                                <span class="label">掉毛程度：</span>
                                <span class="value">{{ getSheddingText(currentCat.sheddingDegree) }}</span>
                              </div>
                              <div class="info-item">
                                <span class="label">性格特点：</span>
                                <span class="value">{{ getPersonalityText(currentCat.personalityType) }}</span>
                              </div>
                              <div class="info-item">
                                <span class="label">品种特征：</span>
                                <span class="value">{{ currentCat.breedFeatures || '暂无' }}</span>
                              </div>
                              <div class="info-item">
                                <span class="label">饲养建议：</span>
                                <span class="value">{{ currentCat.feedingSuggestions || '暂无' }}</span>
                              </div>
                              <div class="info-item">
                                <span class="label">健康注意事项：</span>
                                <span class="value">{{ currentCat.healthAttention || '暂无' }}</span>
                              </div>
                              <div class="info-item">
                                <span class="label">互动需求：</span>
                                <span class="value">{{ currentCat.interactionNeeds || '暂无' }}</span>
                              </div>
                              <div class="info-item">
                                <span class="label">预算参考：</span>
                                <span class="value">{{ currentCat.budgetReference || '暂无' }}</span>
                              </div>
                      
                         