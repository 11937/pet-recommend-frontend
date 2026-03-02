<template>
  <!-- 根容器：整个猫咪推荐页面的外层容器 -->
  <div class="hello">
    <!-- Element UI 布局容器：实现页面整体布局（头部+主体+底部），高度占满屏幕 -->
    <el-container style="height: 100vh; border: 1px solid #eee;">
      <!-- 页面头部：包含Logo和搜索框，高度10vh，横向弹性布局居中排列 -->
      <el-header style="height: auto; padding: 20px 0; display: flex; align-items: center; justify-content: center; gap: 2vw; margin-top:8vh;margin-bottom: 3vh;">
        <!--猫咪推荐弹窗按钮-->
        <el-button style="background-color: #333;" icon="el-icon-edit-outline" @click="recommend_dialogVisible = true">测测你的天命真宠</el-button>
        <!-- Logo+文字容器：修改Logo宽度为「固定最小宽度」 -->
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="width: 5vw; min-width: 60px;"> <!-- 小屏时Logo至少60px宽 -->
            <img src="../assets/logo.jpg" style="width: 100%; height: auto; border-radius: 50%;" alt="logo">
          </div>
          <div>
            <h3 style="color: burlywood; margin: 0; font-size: 1vw; font-size: clamp(14px, 1vw, 18px);">你的宠物推荐官</h3> <!-- 小屏字体至少14px -->
          </div>
        </div>

        <!-- 搜索输入框：小屏时占满宽度 -->
        <el-input
          v-model="searchKeyword"          
          placeholder="请输入猫咪品种/特征（如：布偶、粘人、小户型）" 
          style="width: 25vw; min-width: 200px; max-width: 500px;" 
          :loading="loading"               
          clearable                        
          @clear="handleClear"             
        >
          <!-- 输入框后置插槽：搜索按钮 -->
          <template #append>
            <el-button 
              type="primary"               
              @click="manualSearchCat"     
              :loading="searchLoading"     
            >
              搜索
            </el-button>
          </template>
        </el-input>
      </el-header>

      <!-- 页面主体：展示加载状态、猫咪卡片列表、空数据提示 -->
      <el-main>
        <!-- 加载状态提示：请求数据时展示，居中布局 -->
        <div v-if="searchLoading" style="text-align: center; padding: 50px; width: 100%;">
          <el-loading-spinner></el-loading-spinner>  <!-- Element UI 加载动画 -->
          <p style="margin-top: 10px;">正在查询猫咪信息...</p>
        </div>

        <!-- 猫咪卡片列表：循环渲染猫咪数据，hover显示阴影 -->
        <el-card 
          class="box-card"  
          ref="catCard"              
          v-for="cat in catList"          
          :key="cat.id"                   
          style="margin-bottom: 20px;background: #f5f5f5;"    
          shadow="hover" 
          @click.native="openCatDetail(cat)"
                   
        >
          <!-- 卡片内容容器：包裹单只猫咪的所有信息 -->
        <div class="text item">
          
          <!-- 猫咪品种名 -->
          <h2 style="color: #333; margin: 0 0 5px; font-size: 20px;">{{ cat.breedName }}</h2>
          
          <!-- 品种特点 -->
          <p style="margin-top: 2px; color: #666; line-height: 1.5;">{{ cat.breedFeatures+","+cat.personalityTraits || '暂无额外说明' }}</p>

          <!-- 图片 -->
          <img 
            v-if="cat.imgUrl" 
            v-lazy="'/pet-recommend-frontend/cat_image/' + cat.imgUrl" 
            style="width: 100%; height: 350px; margin-top: 5px; border-radius: 4px;" 
            :alt="cat.breedName + '图片'"
            @error="(e) => e.target.src = placeholderImg"  
          >
          <!-- imgUrl不存在时，直接显示本地占位图 -->
          <img 
            v-else
             v-lazy="placeholderImg" 
            style="width: 100%; height: 350px; margin-top: 5px; border-radius: 4px;" 
            :alt="cat.breedName + '图片'"
          >
        </div>
        </el-card>

        <!-- 空数据提示：仅当用户主动搜索后无结果时展示 -->
        <div v-if="!searchLoading && catList.length === 0 && hasSearched" style="text-align: center; padding: 50px; width: 100%;">
          未查询到 "{{ searchKeyword }}" 相关的猫咪数据
        </div>

        <!-- 猫咪详情弹窗 -->
        <el-dialog
          class="cat-detail-dialog"
          title="猫咪品种详情"
          :visible.sync="dialogVisible"
          width="90%"  
          
        >
          <!-- 核心：外层容器设为flex，实现左右布局 -->
          <div v-if="currentCat" class="cat-detail-container">
            <!-- 左侧：图片区域 -->
            <div class="cat-detail-img-wrap">
              <img 
                v-lazy="currentCat.imgUrl ? '/pet-recommend-frontend/cat_image/' + currentCat.imgUrl : placeholderImg" 
                style="width: 100%; height: auto; border-radius: 4px;" 
                :alt="currentCat.breedName + '详情图'"
                @error="(e) => e.target.src = placeholderImg"
              >
            </div>

            <!-- 右侧：文字介绍区域 -->
            <div class="cat-detail-info-wrap">
              <!-- 标题行 -->
              <div class="cat-detail-title">
                <h2 style="margin: 0 0 10px; color: #333;">{{ currentCat.breedName }}</h2>
                <h3 style="margin: 0 0 15px; color: #666; font-weight: normal;">(品种类型：{{ currentCat.breedType || '未知' }})</h3>
              </div>

              <!-- 文字详情列表 -->
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
                  <span class="value">{{ currentCat.breedFeatures  }}</span>
                </div>
                <div class="info-item">
                  <span class="label">饲养建议：</span>
                  <span class="value">{{ currentCat.feedingSuggestions  }}</span>
                </div>
                <div class="info-item">
                  <span class="label">健康注意事项：</span>
                  <span class="value">{{ currentCat.healthAttention }}</span>
                </div>
                <div class="info-item">
                  <span class="label">互动需求：</span>
                  <span class="value">{{ currentCat.interactionNeeds }}</span>
                </div>
                <div class="info-item">
                  <span class="label">预算参考：</span>
                  <span class="value">{{ currentCat.budgetReference}}</span>
                </div>
              </div>
            </div>
          </div>
        </el-dialog>

        <!-- 猫咪推荐弹窗-->
        <el-dialog
          title="你的天命萌宠"
          :visible.sync="recommend_dialogVisible"
          width="800px"
          :close-on-click-modal="false"
          class="recommend-dialog"
        >
          <!-- 筛选条件表单（统一包裹所有表单项） -->
          <el-form :model="recommendForm" label-width="120px"  class="recommend-form">
            <el-form-item label="饲养经验">
              <el-radio-group v-model="recommendForm.suitableExperience">
                <el-radio label="1">新手</el-radio>
                <el-radio label="2">有经验</el-radio>
                <el-radio label="3">资深铲屎官</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="性格类型(可多选)">
              <el-checkbox-group v-model="recommendForm.personalityType">
                <el-checkbox label="1">活泼粘人</el-checkbox>
                <el-checkbox label="2">温顺安静</el-checkbox>
                <el-checkbox label="3">亲人不粘人</el-checkbox>
                <el-checkbox label="4">慵懒温顺</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="可接受掉毛度(可多选)">
              <el-checkbox-group v-model="recommendForm.sheddingDegree">
                <el-checkbox label="1">轻微掉毛</el-checkbox>
                <el-checkbox label="2">中度掉毛</el-checkbox>
                <el-checkbox label="3">严重掉毛</el-checkbox>
              </el-checkbox-group>
            </el-form-item>



            <el-form-item label="每日照料时长" >
              <el-select  popper-class="care-hour-select-dropdown" v-model="recommendForm.requiredCareHours" placeholder="请选择">
                <el-option label="<1小时" value="1"></el-option>
                <el-option label="1-2小时" value="2"></el-option>
                <el-option label=">2小时" value="3"></el-option>
              </el-select>
            </el-form-item>  

            <!-- 预算等级 + 按钮组：统一表单项结构 -->
            <el-form-item label="预算等级" class="inline-group">
              <!-- 直接在el-form-item的内容区域放下拉框+按钮-->
              <div class="inline-content">
                <!-- 预算等级下拉框 -->
                <el-select popper-class="budget-level-select-dropdown" v-model="recommendForm.budgetLevel" placeholder="请选择" style="width: 200px; margin-right: 20px;">
                  <el-option label="低预算（<1000/月）" value="1"></el-option>
                  <el-option label="中预算（1000-3000/月）" value="2"></el-option>
                  <el-option label="高预算（>3000/月）" value="3"></el-option>
                </el-select>
                <!-- 按钮组 -->
                <el-button type="primary" @click="getRecommendCats" :loading="recommendLoading">
                  立即推荐
                </el-button>
                <el-button class="re_set_button" @click="resetRecommendForm" style="margin-left: 10px;">重置条件</el-button>
              </div>
            </el-form-item>
          </el-form>

          <!-- 推荐结果展示区域 -->
          <div class="recommend-result" v-if="showRecommendResult">
            <h4 class="result-title">为你推荐的猫咪：</h4>
            <el-empty v-if="recommendList.length === 0" description="暂无符合条件的猫咪~">111</el-empty>
            <div class="result-list" v-else>
              <el-card 
                v-for="(cat, index) in recommendList" 
                :key="index" 
                class="recommend-cat-card" 
                @click.native="openCatDetail(cat)"
                shadow="hover"
              >
                <div class="cat-card-content">
                  <h3 style="padding: 0;margin: 0;" class="cat-name">{{ cat.breedName }}</h3>
                  <p class="cat-brief">
                    <span>适配户型：{{ getHousingText(cat.suitableHousing) }}</span>
                    <br>
                    <span>预算：{{ getBudgetText(cat.budgetLevel) }}</span>
                    <br>
                    <span>掉毛程度：{{ getSheddingText(cat.sheddingDegree) }}</span>
                  </p>
                  <img 
                    v-if="cat.imgUrl" 
                    v-lazy="'/pet-recommend-frontend/cat_image/' + cat.imgUrl" 
                    class="cat-img"
                    :alt="cat.breedName + '图片'"
                    @error="(e) => e.target.src = placeholderImg"  
                  >
                  <img 
                    v-else
                    v-lazy="placeholderImg" 
                    class="cat-img"
                    :alt="cat.breedName + '图片'"
                  >
                </div>
              </el-card>
            </div>
          </div>
        </el-dialog>
      </el-main>

      <!-- 页面底部：装13部分-->
      <el-footer style="text-align: center; padding: 10px 0; background: #f5f7fa; border-top: 1px solid #e8eaec;">
        <div style="margin: 0px 0;color: #555; font-size: 14px;">
          <p style="margin: 0px 0;color:burlywood">🐱 你的宠物推荐官 - 猫咪品种指南 🐱</p>
          <p style="margin: 0px 0;color:burlywood">🐱 作者 - A_rose & 豆包 🐱</p>
          <p style="margin: 0px 0; font-size: 13px;color: #999;background: #f5f7fa;">© 2026 版权所有 | 饲养提示：定期驱虫、科学喂养</p>
          <p style="font-size: 12px; color: #999;background: #f5f7fa;">数据来源：宠物行业协会公开资料（仅供参考）</p>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
// 引入axios：用于发送HTTP请求获取后端数据
import axios from 'axios';

export default {
  // 组件名称：用于组件注册/调试
  name: 'HomeIndex',
  // 响应式数据：页面所有动态变量
  data() {
    return {
      recommendForm: { // 推荐筛选表单数据（和后端DTO字段一致）
        suitableHousing: '',
        suitableExperience: '',
        budgetLevel: '',
        sheddingDegree: [], // 新增：掉毛程度（多选）
        personalityType: [], // 性格类型（多选）
        requiredCareHours: ''},
      recommendLoading: false, // 推荐按钮加载状态
      showRecommendResult: false, // 是否展示推荐结果
      recommendList: [], // 推荐结果列表
      recommend_dialogVisible: false,      //猫咪推荐弹窗 隐藏
      dialogVisible: false,     // 弹窗显示/隐藏状态
      currentCat: null,         // 当前点击的猫咪详情数据
      placeholderImg: require('../assets/no-image.png'),    // 本地占位图路径
      searchKeyword: '',        // 搜索关键词：绑定输入框内容
      catList: [],              // 展示列表：存储随机/搜索后的猫咪数据
      allCatData: [],           // 全量数据：存储后端返回的所有猫咪数据（前端过滤用）
      loading: false,           // 输入防抖加载状态：输入过程中显示加载动画
      searchLoading: false,     // 搜索请求加载状态：请求后端时显示加载动画
      searchTimer: null,        // 防抖定时器：避免输入过程中频繁请求接口
      hasSearched: false        // 搜索标记：区分"未搜索"和"搜索无结果"状态
    };
  },
  // 生命周期钩子：组件挂载完成后执行（页面加载完成）
  async mounted() {
    // 第一步：拉取全量猫咪数据（后端需支持空关键词返回全量）
    await this.fetchAllCatData();
    // 第二步：初始化随机展示9张猫咪卡片
    this.initRandomCats();
      
  },
  // 监听属性：监听搜索关键词变化，实现自动搜索
  watch: {
    // 监听searchKeyword的变化，newVal为最新值
    searchKeyword(newVal) {
      // 触发自动搜索逻辑（带防抖）
      this.autoSearchCat(newVal.trim());
    }
  },
  // 方法区：页面所有业务逻辑方法
  methods: {
    async getRecommendCats() {
      // 1. 深拷贝表单数据，避免修改原对象
      const formValues = JSON.parse(JSON.stringify(this.recommendForm));

      // 2. 核心处理：遍历所有参数，统一格式
      Object.keys(formValues).forEach(key => {
        let val = formValues[key];
        
        // ① 多选数组 → 逗号分隔字符串（适配后端多选）
        if (Array.isArray(val)) {
          formValues[key] = val.length > 0 ? val.join(',') : null;
        } 
        // ② 字符串数字 → 数值类型（适配后端Integer/Double）
        else if (val && typeof val === 'string' && !isNaN(val)) {
          formValues[key] = Number(val);
        } 
        // ③ 空字符串/空值 → null（避免后端校验空字符串）
        else if (val === '' || val === undefined) {
          formValues[key] = null;
        }
      });

      // 3. 参数校验：至少选一个有效条件
      const hasCondition = Object.values(formValues).some(val => val !== null);
      if (!hasCondition) {
        this.$message.warning('请至少选择一个筛选条件！');
        return;
      }

      // 4. 发起请求（强制指定Content-Type，适配后端规则）
      this.recommendLoading = true;
      this.showRecommendResult = true;
      try {
        const res = await axios.post(
          "/breed/recommend", 
          formValues,
          {
            // 强制设置请求头（根据后端要求选一种）
            headers: {
              // 方案A：后端接受JSON（默认）
              'Content-Type': 'application/json',
              // 方案B：后端接受form-data（如果后端要求）
              // 'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        if (res.data.code === 200) {
          this.recommendList = res.data.data || [];
          this.$message.success(res.data.msg || '推荐成功！');
        } else {
          this.$message.error(res.data.msg || '推荐失败');
        }
      } catch (err) {
        // 打印详细错误（便于排查）
        console.error('推荐请求错误详情：', {
          status: err.response?.status,
          data: err.response?.data, // 后端返回的具体错误提示
          requestParams: formValues // 前端发送的最终参数
        });
        this.$message.error('推荐失败：' + (err.response?.data?.msg || err.message));
        this.recommendList = [];
      } finally {
        this.recommendLoading = false;
      }
    },
    /**
     * 重置推荐筛选表单
     */
    resetRecommendForm() {
      this.recommendForm = {
        suitableHousing: '',
        suitableExperience: '',
        budgetLevel: '',
        sheddingDegree: [],
        personalityType: [],
        requiredCareHours: ''
      };
      this.recommendList = [];
      this.showRecommendResult = false;
    },

    //关闭猫咪卡片详情页
     handleClose(done) {
        this.$confirm('确认关闭？')
          // eslint-disable-next-line no-unused-vars
          .then(_ => {
            done();
          })
          // eslint-disable-next-line no-unused-vars
          .catch(_ => {});
      },

    /**
    * 打开猫咪详情弹窗
    * @param {Object} cat - 点击的猫咪数据
    */
    openCatDetail(cat){
      this.currentCat = cat; // 赋值当前猫咪数据，供弹窗渲染
      this.dialogVisible = true; // 打开弹窗
    },

    /**
     * 初始化随机猫咪卡片：从全量数据中随机筛选展示
     * 核心逻辑：深拷贝数组→随机排序→截取，避免修改原数组
     */
    initRandomCats() {
      // 全量数据为空时直接返回，避免报错
      if (!this.allCatData.length) return;
      // 深拷贝全量数据：防止修改原数组导致数据污染

      const showData = [...this.allCatData].slice(0, -1);
      this.catList = showData.sort(() => Math.random() - 0.5);
    },

    /**
     * 拉取全量猫咪数据：调用后端接口获取所有猫咪信息
     * 用途：为前端过滤、随机展示提供数据源
     */
    async fetchAllCatData() {
      // 开启加载状态：展示加载动画
      this.searchLoading = true;
      try {
        // 调用后端接口：POST请求，传空关键词获取全量数据
        const res = await axios.post("/breed/list", { breedName: '' });
        // 存储全量数据：无数据时赋值空数组
        this.allCatData = res.data.data || [];
      } catch (err) {
        // 错误处理：打印日志+提示用户
        console.error('拉取全量猫咪数据失败：', err);
        this.$message.error('加载猫咪数据失败，请稍后重试');
        this.allCatData = [];
      } finally {
        // 关闭加载状态：无论成功/失败都关闭动画
        this.searchLoading = false;
      }
    },

    /**
     * 自动搜索逻辑（带防抖）
     * @param {String} val - 处理后的搜索关键词（已去空格）
     * 核心：500ms内未输入则触发搜索，避免频繁请求接口
     */
    autoSearchCat(val) {
      // 清除上一次的定时器：防抖核心，避免多次触发
      clearTimeout(this.searchTimer);
      // 关键词为空：恢复随机卡片，重置状态
      if (!val) {
        this.initRandomCats();   // 恢复随机57张卡片
        this.loading = false;    // 关闭输入加载状态
        this.hasSearched = false;// 重置搜索标记
        return;
      }

      // 开启输入加载状态
      this.loading = true;
      // 500ms防抖定时器：输入停止500ms后执行搜索
      this.searchTimer = setTimeout(() => {
        // 调用前端过滤方法：匹配关键词
        this.filterCatData(val);
        this.loading = false;    // 关闭输入加载状态
        this.hasSearched = true; // 标记为已搜索
      }, 500);
    },

    /**
     * 手动搜索逻辑：点击搜索按钮触发
     * 核心：校验关键词→清除防抖定时器→执行过滤
     */
    manualSearchCat() {
      // 关键词去空格
      const val = this.searchKeyword.trim();
      // 空关键词校验：提示用户输入
      if (!val) {
        this.$message.warning('请输入搜索关键词');
        return;
      }
      // 清除防抖定时器：避免自动搜索和手动搜索重复触发
      clearTimeout(this.searchTimer);
      // 执行前端过滤
      this.filterCatData(val);
      // 标记为已搜索
      this.hasSearched = true;
    },

    /**
     * 前端全维度过滤：匹配猫咪所有属性（品种/性格/环境等）
     * @param {String} keyword - 搜索关键词
     * 核心：拼接所有属性为字符串→不区分大小写模糊匹配
     */
    filterCatData(keyword) {
      // 全量数据为空：提示用户
      if (!this.allCatData.length) {
        this.catList = [];
        this.$message.warning('暂无猫咪数据可搜索');
        return;
      }

      // 过滤逻辑：遍历全量数据，匹配关键词
      this.catList = this.allCatData.filter(cat => {
        // 拼接猫咪所有属性为字符串：枚举值转文字+普通字段
        const catText = [
          cat.breedName || '',                          // 品种名
          this.getHousingText(cat.suitableHousing),     // 饲养环境（枚举转文字）
          `${cat.requiredCareHours}小时`,               // 护理时长（拼接单位）
          this.getExperienceText(cat.suitableExperience),// 饲养经验（枚举转文字）
          this.getBudgetText(cat.budgetLevel),           // 饲养预算（枚举转文字）
          this.getSheddingText(cat.sheddingDegree),     // 掉毛程度（枚举转文字）
          this.getPersonalityText(cat.personalityType), // 性格特点（枚举转文字）
          cat.extraNote || ''                            // 额外说明
        ].join(' '); // 拼接为一个大字符串，便于模糊匹配

        // 不区分大小写模糊匹配：关键词包含在属性字符串中则匹配成功
        return catText.toLowerCase().includes(keyword.toLowerCase());
      });

      // 无匹配结果：提示用户
      if (this.catList.length === 0) {
        this.$message.info('未查询到相关猫咪信息');
      }
    },

    /**
     * 清空输入框回调：重置关键词+恢复随机卡片
     * 触发时机：点击输入框的清空按钮
     */
    handleClear() {
      this.searchKeyword = '';    // 清空关键词
      this.hasSearched = false;   // 重置搜索标记
      this.initRandomCats();      // 恢复随机57张卡片
    },

    /**
     * Logo图片加载失败处理：替换为占位图
     * @param {Event} e - 图片加载失败事件
     */
    handleImgError(e) {
      e.target.src = 'https://via.placeholder.com/60x60?text=LOGO';
    },

    /**
     * 饲养环境枚举值转文字
     * @param {Number} type - 数据库存储的枚举值（1/2/3）
     * @returns {String} 转义后的文字描述
     */
    getHousingText(type) {
      const map = { 1: '小户型', 2: '中户型', 3: '大户型/别墅' };
      return map[type] || '未知';
    },
    /**
     * 饲养经验枚举值转文字
     * @param {Number} type - 数据库存储的枚举值（1/2/3）
     * @returns {String} 转义后的文字描述
     */
    getExperienceText(type) {
      const map = { 1: '新手', 2: '有一定经验', 3: '资深铲屎官' };
      return map[type] || '未知';
    },
    /**
     * 饲养预算枚举值转文字
     * @param {Number} type - 数据库存储的枚举值（1/2/3）
     * @returns {String} 转义后的文字描述
     */
    getBudgetText(type) {
      const map = { 1: '低', 2: '中', 3: '高' };
      return map[type] || '未知';
    },
    /**
     * 掉毛程度枚举值转文字
     * @param {Number} type - 数据库存储的枚举值（1/2/3）
     * @returns {String} 转义后的文字描述
     */
    getSheddingText(type) {
      const map = { 1: '轻度', 2: '中度', 3: '重度' };
      return map[type] || '未知';
    },
    /**
     * 性格特点枚举值转文字
     * @param {Number} type - 数据库存储的枚举值（1/2/3/4）
     * @returns {String} 转义后的文字描述
     */
    getPersonalityText(type) {
      const map = { 1: '活泼粘人', 2: '温顺安静', 3: '亲人不粘人', 4: '慵懒温顺' };
      return map[type] || '未知';
    }
  },
  // 生命周期钩子：组件销毁前执行，清除定时器避免内存泄漏
  beforeDestroy() {
    clearTimeout(this.searchTimer);
  }
};
</script>

<style scoped>
/* ========== 基础全局样式 ========== */
/* 1. 基础字体：用rem做相对单位，适配不同屏幕 */
html {
  font-size: 16px; /* 基准字体大小（1rem=16px） */
}
@media (max-width: 768px) {
  html {
    font-size: 14px; /* 小屏时缩小基准字体 */
  }
}

/* 2. h3标签样式（Logo下方文字） */
h3 {
  margin: 2rem 0 0; /* 用rem替代px，适配字体缩放 */
  font-size: 1.2rem; /* 响应式字体 */
}

/* 3. 其他基础样式（预留） */
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 0.625rem;
}
a {
  color: #42b983;
}

/* ========== 主内容区布局样式 ========== */
/* 4. 主内容区：不同屏幕下调整内边距和间距 */
.el-main {
  padding: 1.25rem; /* 20px → 1.25rem */
  display: flex;
  justify-content: center; /* 卡片居中排列（之前是靠左，小屏更协调） */
  gap: 1.25rem; /* 20px → 1.25rem */
  flex-wrap: wrap;
  min-height: calc(100vh - 20vh);
}

/* ========== 卡片内容样式 ========== */
/* 5. 卡片内文字基础样式：响应式字体 */
.text {
  font-size: 0.875rem; /* 14px → 0.875rem */
  color: #333;
}

/* 6. 卡片内内容容器：不同屏幕下调整内边距 */
.item {
  padding: 1rem; /* 18px → 1rem（小屏自动缩小） */
  border-bottom: 1px solid #eee;
}
.item:last-child {
  border-bottom: none;
}

/* 7. 猫咪品种名：响应式字体+间距 */
h2 {
  color: #333;
  margin: 0 0 0.3125rem; /* 10px → 0.3125rem */
  font-size: 1.125rem; /* 18px → 1.125rem */
}

/* 8. 额外说明：响应式间距 */
.item p:last-of-type {
  margin-top: 0.625rem; /* 15px → 0.625rem */
}

/* ========== 卡片核心样式 ========== */
/* 9. 猫咪卡片：多断点适配宽度，统一视觉 */
.box-card {
  min-width: 18.75rem; /* 300px → 18.75rem */
  max-width: 25rem; /* 400px → 25rem */
  width: 100%; /* 默认占满宽度，由媒体查询控制每行数量 */
  box-sizing: border-box;
  transition: all 0.3s;
  margin-bottom: 1.25rem; /* 20px → 1.25rem */
  cursor: pointer; /* 新增：鼠标悬浮卡片显示手型，提示可点击 */
}

/* 平板端（768px ~ 992px）：每行2张卡片 */
@media (min-width: 768px) and (max-width: 992px) {
  .box-card {
    width: calc(50% - 1.25rem); /* 每行2张，减去间距 */
  }
}

/* 大屏端（≥992px）：每行4张卡片 */
@media (min-width: 992px) {
  .box-card {
    width: calc(25% - 1.25rem); /* 每行4张，减去间距 */
  }
}

/* ========== 响应式适配样式 ========== */
/* 10. 小屏端（≤768px）：单独调整头部和卡片 */
@media (max-width: 768px) {
  /* 头部布局：换行+占满宽度 */
  .el-header {
    flex-wrap: wrap;
    padding: 0.625rem;
    gap: 1rem; /* 小屏减小间距 */
  }
  /* 搜索框：小屏占满宽度 */
  .el-input {
    width: 90% !important; /* 覆盖原有宽度，小屏占90% */
    min-width: auto !important;
    max-width: none !important;
  }
  /* 卡片：小屏 */
  .el-main {
    padding: 0.1rem !important; /* 修正：补充单位，调整!important位置 */
    display: flex;
    justify-content: center;
    gap: 0; /* 清除卡片横向间距 */
    flex-wrap: wrap;
    min-height: calc(100vh - 20vh);
  }
  .item {
    padding: 0 !important; /* 清除内容与卡片的间距 */
    border-bottom: none; /* 清除底部边框 */
  }
  .box-card {
    /* 宽度：缩小间距，保持每行2个 */
    width: calc(50% - calc(1.25rem * 0.1)); 
    /* 最小宽度：调整为8rem（128px），避免卡片过窄变形 */
    min-width: 8rem; 
    /* 底部间距：清除 */
    margin-bottom: 0; 
    /* 卡片内边距：清除 */
    padding: 0;
  }

  /* 图片高度：按平板端(350px)的40%等比例缩小 */
  .box-card .item img {
    height: calc(350px * 0.4) !important; 
    width: 100% !important;
    object-fit: cover !important; /* 保持图片比例不变 */
  }

  /* 文字大小：按平板端等比例缩小 */
  .box-card .item h2 {
    font-size: calc(1.125rem * 0.8) !important; /* 1.125*0.8=0.9rem */
    margin-bottom: 0; /* 间距同步缩小 */
  }
  .box-card .item p {
    font-size: calc(0.875rem * 0.8) !important; /* 0.875*0.8=0.7rem */
  }
}
/* ========== 交互效果样式 ========== */
/* 11. 卡片悬浮效果：统一交互 */
.box-card:hover {
  transform: translateY(-0.3125rem); /* 5px → 0.3125rem */
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1); /* 增强阴影，各端一致 */
}
</style>

<!-- 非scoped样式：控制左右布局和样式 -->
<style>
.cat-detail-dialog .el-dialog{
  width: 65vw !important;
  height: auto;
}

/* 弹窗内容区：清除默认内边距，避免间距问题 */
.cat-detail-dialog .el-dialog__body {
  padding: 20px !important;
  margin: 0;
}

/* 左右布局外层容器 */
.cat-detail-container {
  display: flex;
  gap: 20px; /* 左右区域之间的间距 */
  align-items: flex-start; /* 顶部对齐 */
  width: 80%;
}

/* 左侧图片区域：固定宽度，适配布局 */
.cat-detail-img-wrap {
  width: 45%; /* 图片区占45%宽度 */
  height: 100%; /* 关键：让容器占满父级高度，垂直居中才会生效 */
  max-width: 500px; /* 限制图片最大宽度，避免过大 */
  min-width: 250px; /* 限制最小宽度，避免过小 */
  display: flex !important;
  align-items: center !important;
}

/* 右侧文字区域：自动填充剩余宽度 */
.cat-detail-info-wrap {
  flex: 1; /* 占满剩余宽度 */
  min-width: 280px; /* 小屏下文字区不挤压 */
}

/* 文字详情列表样式优化 */
.detail-info {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 每行文字的间距 */
}
.info-item {
  display: flex;
  /* 默认不换行，仅在内容过长时强制换行 */
  flex-wrap: nowrap; 
  align-items: center; /* 标签和内容垂直居中对齐 */
  line-height: 1.6;
  /* 如内容过长，超出时显示省略号，避免溢出 */
  overflow: hidden;
}
.info-item .label {
  font-weight: bold;
  color: #333;
  /* 减小标签最小宽度，给内容更多空间 */
  min-width: 70px; 
  white-space: nowrap; /* 标签强制不换行 */
}
.info-item .value {
  color: #666;
  flex: 1;
  /* 内容过长时显示省略号 */
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/* 小屏适配：768px以下自动变回上下布局，避免挤压 */
@media (max-width: 768px) {
  .cat-detail-container {
    flex-direction: column; /* 纵向排列 */
    gap: 15px;
    width: 100%; /* 确保容器占满弹窗宽度 */
  }
  .cat-detail-img-wrap {
    width: 100%; /* 图片占满宽度 */
    max-width: none;
  }
  .cat-detail-dialog .el-dialog {
    width: 95% !important;
    height: auto !important; /* 小屏弹窗高度自适应，不固定70vh */
    max-height: 90vh; /* 限制弹窗最大高度，避免超出屏幕 */
    overflow-y: auto; /* 弹窗内容过多时，弹窗自身滚动 */
  }
  /* 选择器加空格 + 取消强制不换行 + 允许文字换行 */
  .detail-info .info-item {
    white-space: normal; /* 恢复默认，允许文字换行（核心！） */
    width: 100%; /* 占满父级宽度 */
    box-sizing: border-box; /* 宽度包含内边距，避免溢出 */
    padding-right: 5px; /* 留少量右侧间距，避免贴边 */
  }
  .detail-info .label {
    white-space: nowrap; /* 标签仍强制不换行（可选，保持标签整齐） */
    min-width: 70px; /* 小屏缩小标签最小宽度，适配窄屏 */
    width: auto; /* 取消固定宽度，自适应 */
  }
  .detail-info .value {
    white-space: normal; /* 内容允许换行（核心！） */
    width: calc(100% - 80px); /* 内容宽度=父级-标签宽度，避免挤压 */
    word-wrap: break-word; /* 超长单词/字符自动换行，比如长数字/链接 */
  }
}
</style>

<style>
/* ========== 推荐弹窗全局样式 ========== */
.recommend-dialog {
  font-weight: 700 !important; /* 标准粗体，可改600/900 */
  
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
}

/* ========== 表单统一样式 ========== */
.recommend-form {
  width: 100%;
  padding: 5px 0;
}

/* 所有表单项：统一布局 */
.recommend-form .el-form-item {
  display: flex;
  align-items: center;  /* 标签+内容垂直居中 */
  margin-bottom: 18px !important;  /* 表单项间距统一 */
  width: 100%;
}

/* 所有标签：统一宽度+对齐 */
.recommend-form .el-form-item__label {
  width: 200px !important;  /* 和el-form的label-width一致 */
  text-align: right !important;  /* 标签右对齐 */
  padding-right: 40px !important;  /* 标签与内容的间距 */
  color: #222;
  font-weight: 600;
  font-size: 15px;
  line-height: 1.5;
}

/* 表单项内容区域：统一占剩余宽度 */
.recommend-form .el-form-item__content {
  flex: 1;  /* 占满剩余宽度，确保所有内容起始位置一致 */
  margin-left: 0 !important;
}

/* ========== 预算等级+按钮组样式 ========== */
.budget-btn-group {
  display: flex;
  align-items: center;  /* 下拉框+按钮垂直居中 */
}

/* ========== 单选/复选框选项文字 ========== */
.recommend-form .el-radio__label,
.recommend-form .el-checkbox__label {
  color: #444;
  font-size: 14px;
  margin-left: 6px;
  transition: color 0.2s;
}
.recommend-form .el-radio__label:hover,
.recommend-form .el-checkbox__label:hover {
  color: burlywood;
}

/* ========== 下拉框样式 ========== */
.care-hour-select-dropdown .el-select-dropdown__item {
  background: burlywood !important;
  color: #000 !important;
}
.budget-level-select-dropdown .el-select-dropdown__item {
  background: burlywood !important;
  color: #000 !important;
}
.recommend-form .el-select .el-input__inner {
  color: #333;
  font-size: 14px;
  border-radius: 4px;
}
.recommend-form .el-select-dropdown__item.selected {
  color: burlywood;
}

/* ========== 按钮样式（解决文字不可见） ========== */
.recommend-form .el-button {
  font-size: 14px;
  font-weight: 500;
}
/* 立即推荐按钮 */
.recommend-form .el-button--primary {
  background-color: #333;
  border-color: #333;
  color: #fff !important;
}
.recommend-form .el-button--primary:hover {
  background-color: #555;
  border-color: #555;
}


/* 重置条件按钮 */
.recommend-form .el-button--default > span {
  color: #333 !important;  /* 深灰文字，清晰可见 */
  border-color: #ddd;
}
.recommend-form .el-button--default:hover {
  color: #222 !important;
  border-color: burlywood;
}

/* ========== 推荐结果样式 ========== */
.recommend-result {
  margin: 0px;
  padding: 2px;
}
.recommend-result .result-title {
  color: #222;
  font-size: 17px;
  font-weight: 600;
  margin: 5px 0 5px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}
.result-list {
  display: flex;
  flex-wrap: wrap;
  margin: 2px;
  padding: 2px;
}
.recommend-cat-card {
  margin: 2px;
  padding: 2px;
  width: calc(30%);
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}
.recommend-cat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}
.cat-card-content {
  padding: 5px;
}
.cat-name {
  color: #333;
  font-size: 16px;
  margin: 0 0 5px;
}
.cat-brief > span {
  color: #333;
  font-size: 13px;
  line-height: 1.4;
  margin: 0 0 5px;
}
.cat-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}

/* ========== 小屏适配（屏幕宽度≤768px，主要针对手机端） ========== */
@media (max-width: 768px) {
  /* 1. 控制弹窗外层容器宽度：占满父容器，高度自适应 */
  .recommend-dialog {
    width: 100% !important;  /* 强制占满宽度，消除两侧空白 */
    height: auto;            /* 高度随内容自适应，不固定 */
  }

  /* 2. 控制Element UI弹窗核心容器：占满整个视口宽度（100vw），彻底消除右侧空白 */
  .recommend-dialog .el-dialog{
    width: 100vw !important; /* vw是视口宽度单位，100vw=屏幕宽度 */
  }

  /* 3. 弹窗标题栏：占满弹窗宽度，避免内容挤压 */
  .recommend-dialog .el-dialog__header{
    width: 100% !important;
  }

  /* 4. 弹窗内容区：占满弹窗宽度，消除内容区右侧空白 */
  .recommend-dialog .el-dialog__body{
    width: 100% !important;
  }

  /* 5. 表单项目适配：改为垂直布局（标签在上，输入框在下），左对齐 */
  .recommend-form .el-form-item {
    flex-direction: column;    /* 替换默认水平布局为垂直布局 */
    align-items: flex-start;   /* 子元素左对齐（而非默认居中） */
  }

  /* 6. 重置条件按钮适配：单独下一行 + 右对齐 */
  .re_set_button {
    margin-top: 10px;          /* 与上一个元素拉开垂直间距 */
    display: block;            /* 转为块级元素，独占一行 */
    margin-left: auto !important; /* 左外边距自动，实现块级元素右对齐 */
  }

  /* 7. 表单标签适配：左对齐，清除右侧内边距，增加底部间距 */
  .recommend-form .el-form-item__label {
    text-align: left !important;  /* 标签文字左对齐（默认右对齐） */
    padding-right: 0 !important;  /* 清除默认右侧内边距 */
    margin-bottom: 8px;           /* 与下方输入框拉开间距 */
  }

  /* 8. 预算按钮组适配：垂直布局，占满宽度，元素间加间距 */
  .budget-btn-group {
    flex-direction: column;  /* 按钮组从水平改为垂直排列 */
    width: 100%;             /* 占满父容器宽度 */
    gap: 10px;               /* 子元素间的垂直间距（替代margin） */
  }

  /* 9. 预算按钮组内的下拉框：占满宽度 */
  .budget-btn-group .el-select {
    width: 100% !important;  /* 强制占满宽度，适配手机屏幕 */
  }

  /* 10. 预算按钮组内的按钮：占满宽度，清除左侧间距 */
  .budget-btn-group .el-button {
    width: 100%;             /* 按钮占满宽度，方便手机点击 */
    margin-left: 0 !important; /* 清除默认左侧间距 */
  }

  /* 11. 推荐结果区域：减小内边距，适配小屏 */
  .recommend-result{
    padding: 0 !important;  /* 原5px→2px，大幅缩小内容区内边距 */
    margin: 0 !important;     /* 清除内容区外边距 */
  }

  /* 12. 推荐结果标题：调整间距和下内边距，优化排版 */
  .recommend-result .result-title {
    margin: 2px 0 !important;    /* 原10px 0 10px→2px 0，几乎无上下间距 */
    padding-bottom: 2px !important; /* 原5px→2px，缩小标题和列表的间距 */
  }

  /* 13. 推荐结果列表：flex布局+自动换行，实现多列排列 */
  .result-list {
    display: flex;           /* 开启flex布局 */
    flex-wrap: wrap;         /* 空间不足时自动换行 */
    margin: 0 !important;      /* 清除列表外边距 */
    padding: 0 !important;     /* 清除列表内边距 */
  }

  /* 14. 猫咪卡片适配：宽度自适应，实现双列布局（约45%宽度） */
  .recommend-cat-card {
      /* 宽度：缩小间距，保持每行2个 */
    width: calc(45% - calc(1.25rem * 0.1)); 
    /* 最小宽度：调整为8rem（128px），避免卡片过窄变形 */
    min-width: 8rem; 
    /* 底部间距：清除 */
    margin-bottom: 0; 
    /* 卡片内边距：清除 */
    padding: 0;
  }
}
</style>
